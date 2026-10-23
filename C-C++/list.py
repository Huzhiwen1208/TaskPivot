import sys

fx = []
gx = []
hx = []

n, m = 0, 0
take = 0
iline = []
uline = []

lines = sys.stdin.readlines()

for i, line in enumerate(lines):
    iline = line.split( )
    uline = [int(iline[0]), int(iline[1])]
    if i == 0:
        n, m = uline[0], uline[1]
        continue

    if take >= n:
        gx.append(uline)
    else:
        fx.append(uline)
    take += 1


fx_point = 0
gx_point = 0

while fx_point < len(fx) and gx_point < len(gx):
    if fx[fx_point][0] > gx[fx_point][0]:
        hx.append(fx[fx_point])
        fx_point += 1
    elif fx[fx_point][0] < gx[fx_point][0]:
        hx.append(gx[gx_point])
        gx_point += 1
    else:
        fx_point += 1
        gx_point += 1

print(hx)