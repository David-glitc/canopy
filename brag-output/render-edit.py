from pathlib import Path
import subprocess

root = Path(__file__).resolve().parent
frames = [
    Path('/tmp/canopy-hook.png'),
    Path('/tmp/canopy-frames-v2/element-0220.png'),
    Path('/tmp/canopy-frames-v2/element-0420.png'),
    Path('/tmp/canopy-frames-v2/element-0720.png'),
    Path('/tmp/canopy-frames-v2/element-1160.png'),
    Path('/tmp/canopy-frames-v2/element-1600.png'),
    Path('/tmp/canopy-frames-v2/element-1980.png'),
    Path('/tmp/canopy-outro.png'),
]
starts = [0.0, 5.206, 10.012, 18.930, 33.840, 46.585, 62.783, 70.154]
total = 80.0
crossfade = 0.35
durations = [starts[i + 1] - starts[i] + crossfade for i in range(len(starts) - 1)] + [total - starts[-1]]

srt = root / 'composition/public/audio/voiceover.srt'
srt.write_text((root / 'composition/public/audio/voiceover.vtt').read_text(), encoding='utf-8')
filter_path = root / 'composition/edit-filter.txt'
filters = []
for i, duration in enumerate(durations):
    direction = 1 if i % 2 == 0 else -1
    x = "iw/2-(iw/zoom/2)" if direction > 0 else "iw-iw/zoom"
    filters.append(
        f"[{i}:v]crop=1920:950:0:0,pad=1920:1080:0:0:black,"
        f"zoompan=z='min(max(zoom,pzoom)+0.00010,1.025)':x='{x}':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,"
        f"trim=duration={duration:.3f},setpts=PTS-STARTPTS,fps=30,settb=AVTB,format=yuv420p,setsar=1[v{i}]"
    )
last = 'v0'
for i in range(1, len(frames)):
    out = f'x{i}'
    filters.append(f"[{last}][v{i}]xfade=transition=fade:duration={crossfade}:offset={starts[i]:.3f}[{out}]")
    last = out
subtitle_path = str(srt).replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'")
filters.append(
    f"[{last}]subtitles='{subtitle_path}':force_style='FontName=DejaVu Sans,FontSize=18,"
    "PrimaryColour=&H00F4F2F7,BackColour=&HD0000000,BorderStyle=3,Outline=0,Shadow=0,MarginV=24,Alignment=2'[vout]"
)
filters.extend([
    '[8:a]aresample=48000,aformat=channel_layouts=stereo,volume=1[voice]',
    '[9:a]atrim=start=7:duration=80,asetpts=PTS-STARTPTS,volume=0.16,afade=t=in:st=0:d=1,afade=t=out:st=75:d=4[music]',
    '[10:a]asplit=5[c1][c2][c3][c4][c5]',
    '[c1]adelay=5200|5200,volume=0.28[cd1]',
    '[c2]adelay=10000|10000,volume=0.28[cd2]',
    '[c3]adelay=18900|18900,volume=0.28[cd3]',
    '[c4]adelay=33800|33800,volume=0.28[cd4]',
    '[c5]adelay=62700|62700,volume=0.28[cd5]',
    '[11:a]asplit=2[r1][r2]',
    '[r1]adelay=46500|46500,volume=0.45[rv1]',
    '[r2]adelay=70100|70100,volume=0.50[rv2]',
    '[voice][music][cd1][cd2][cd3][cd4][cd5][rv1][rv2]amix=inputs=9:duration=longest:normalize=0,alimiter=limit=0.95[aout]',
])
filter_path.write_text(';\n'.join(filters), encoding='utf-8')

cmd = ['/home/david/.local/bin/ffmpeg', '-y']
for frame, duration in zip(frames, durations):
    cmd += ['-loop', '1', '-framerate', '30', '-t', f'{duration:.3f}', '-i', str(frame)]
cmd += [
    '-i', str(root / 'composition/public/audio/voiceover.mp3'),
    '-stream_loop', '-1', '-i', str(root / 'composition/public/audio/music.mp3'),
    '-i', str(root / 'composition/public/audio/click.ogg'),
    '-i', str(root / 'composition/public/audio/reveal.ogg'),
    '-filter_complex_script', str(filter_path),
    '-map', '[vout]', '-map', '[aout]', '-t', '80', '-r', '30',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
    str(root / 'canopy-demo.mp4'),
]
subprocess.run(cmd, check=True)
