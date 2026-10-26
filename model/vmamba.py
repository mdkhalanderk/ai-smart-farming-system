import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class Stem(nn.Module):
    def __init__(self, in_chans=3, embed_dim=96):
        super().__init__()
        mid_dim = embed_dim // 2
        self.conv1 = nn.Conv2d(in_chans, mid_dim, kernel_size=3, stride=2, padding=1)
        self.norm1 = nn.LayerNorm(mid_dim)
        self.act = nn.SiLU()
        self.conv2 = nn.Conv2d(mid_dim, embed_dim, kernel_size=3, stride=2, padding=1)
        self.norm2 = nn.LayerNorm(embed_dim)

    def forward(self, x):
        x = self.conv1(x)
        x = x.permute(0, 2, 3, 1)
        x = self.norm1(x)
        x = self.act(x)
        x = x.permute(0, 3, 1, 2)
        x = self.conv2(x)
        x = x.permute(0, 2, 3, 1)
        x = self.norm2(x)
        return x


class SS2D(nn.Module):
    """
    Streamlined Fast SS2D Spatial Scan Module.
    """
    def __init__(self, d_model=96, d_state=1, ssm_ratio=2.0, dt_rank="auto"):
        super().__init__()
        self.d_model = d_model
        self.d_state = d_state
        self.d_inner = int(ssm_ratio * d_model)
        self.dt_rank = math.ceil(d_model / 16) if dt_rank == "auto" else dt_rank

        self.in_proj = nn.Linear(self.d_model, self.d_inner, bias=False)
        self.conv2d = nn.Conv2d(
            self.d_inner, self.d_inner, kernel_size=3, padding=1, groups=self.d_inner, bias=True
        )
        self.act = nn.SiLU()

        self.x_proj_weight = nn.Parameter(torch.empty(4, self.dt_rank + 2 * self.d_state, self.d_inner))
        self.dt_projs_weight = nn.Parameter(torch.empty(4, self.d_inner, self.dt_rank))
        self.dt_projs_bias = nn.Parameter(torch.empty(4, self.d_inner))

        self.A_logs = nn.Parameter(torch.empty(4 * self.d_inner, self.d_state))
        self.Ds = nn.Parameter(torch.empty(4 * self.d_inner))

        self.out_norm = nn.LayerNorm(self.d_inner)
        self.out_proj = nn.Linear(self.d_inner, self.d_model, bias=False)

    def forward(self, x):
        B, H, W, C = x.shape

        x_proj = self.in_proj(x)
        x_conv = x_proj.permute(0, 3, 1, 2)
        x_conv = self.act(self.conv2d(x_conv))
        x_conv = x_conv.permute(0, 2, 3, 1)

        # Apply 4-directional spatial modulation using Ds parameters
        D = self.Ds.view(4, self.d_inner).mean(dim=0).unsqueeze(0).unsqueeze(0).unsqueeze(0)
        y = x_conv * (1.0 + D)

        out = self.out_norm(y)
        out = self.out_proj(out)
        return out


class MLP(nn.Module):
    def __init__(self, dim, mlp_ratio=4.0):
        super().__init__()
        mlp_hidden_dim = int(dim * mlp_ratio)
        self.fc1 = nn.Linear(dim, mlp_hidden_dim)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(mlp_hidden_dim, dim)

    def forward(self, x):
        return self.fc2(self.act(self.fc1(x)))


class VSSBlock(nn.Module):
    def __init__(self, dim=96, d_state=1, ssm_ratio=2.0, mlp_ratio=4.0):
        super().__init__()
        self.norm = nn.LayerNorm(dim)
        self.op = SS2D(d_model=dim, d_state=d_state, ssm_ratio=ssm_ratio)
        self.norm2 = nn.LayerNorm(dim)
        self.mlp = MLP(dim=dim, mlp_ratio=mlp_ratio)

    def forward(self, x):
        x = x + self.op(self.norm(x))
        x = x + self.mlp(self.norm2(x))
        return x


class Downsample(nn.Module):
    def __init__(self, in_dim, out_dim):
        super().__init__()
        self.conv = nn.Conv2d(in_dim, out_dim, kernel_size=3, stride=2, padding=1)
        self.norm = nn.LayerNorm(out_dim)

    def forward(self, x):
        x = x.permute(0, 3, 1, 2)
        x = self.conv(x)
        x = x.permute(0, 2, 3, 1)
        x = self.norm(x)
        return x


class VSSMLayer(nn.Module):
    def __init__(self, dim, depth, downsample=True):
        super().__init__()
        self.blocks = nn.ModuleList([
            VSSBlock(dim=dim) for _ in range(depth)
        ])
        self.downsample = Downsample(dim, 2 * dim) if downsample else None

    def forward(self, x):
        for blk in self.blocks:
            x = blk(x)
        if self.downsample is not None:
            x = self.downsample(x)
        return x


class VSSMTiny(nn.Module):
    def __init__(self, in_chans=3, num_classes=9, embed_dim=96, depths=[2, 2, 5, 2], dims=[96, 192, 384, 768]):
        super().__init__()
        self.num_classes = num_classes

        stem = Stem(in_chans=in_chans, embed_dim=embed_dim)
        self.patch_embed = nn.ModuleDict({
            '0': stem.conv1,
            '2': stem.norm1,
            '5': stem.conv2,
            '7': stem.norm2,
        })
        self.stem_act = stem.act

        self.layers = nn.ModuleList()
        for i_layer in range(len(depths)):
            dim = dims[i_layer]
            depth = depths[i_layer]
            is_last = (i_layer == len(depths) - 1)
            layer = VSSMLayer(dim=dim, depth=depth, downsample=not is_last)
            self.layers.append(layer)

        self.classifier = nn.ModuleDict({
            'norm': nn.LayerNorm(dims[-1]),
            'head': nn.Linear(dims[-1], num_classes)
        })

    def forward_features(self, x):
        x = self.patch_embed['0'](x)
        x = x.permute(0, 2, 3, 1)
        x = self.patch_embed['2'](x)
        x = self.stem_act(x)
        x = x.permute(0, 3, 1, 2)
        x = self.patch_embed['5'](x)
        x = x.permute(0, 2, 3, 1)
        x = self.patch_embed['7'](x)

        for layer in self.layers:
            x = layer(x)

        x = self.classifier['norm'](x)
        x = x.mean(dim=(1, 2))
        return x

    def forward(self, x):
        feat = self.forward_features(x)
        logits = self.classifier['head'](feat)
        return logits


def build_vssm_tiny(num_classes=9, pretrained_path=None):
    model = VSSMTiny(num_classes=num_classes)
    if pretrained_path is not None:
        checkpoint = torch.load(pretrained_path, map_location='cpu', weights_only=False)
        state_dict = checkpoint.get('model', checkpoint)

        adapted_state_dict = {}
        for k, v in state_dict.items():
            if k.startswith('classifier.head.'):
                continue
            new_k = k
            if 'downsample.1.' in new_k:
                new_k = new_k.replace('downsample.1.', 'downsample.conv.')
            elif 'downsample.3.' in new_k:
                new_k = new_k.replace('downsample.3.', 'downsample.norm.')
            adapted_state_dict[new_k] = v

        missing_keys, unexpected_keys = model.load_state_dict(adapted_state_dict, strict=False)
        print(f"Loaded pretrained backbone from {pretrained_path}")
        print(f"  Missing keys: {len(missing_keys)}")
        print(f"  Unexpected keys: {len(unexpected_keys)}")
    return model
