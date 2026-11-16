# Your posters

Each poster has its own folder here:

```text
posters/team-day/
  brief.json     the message and the exact copy
  poster.html    the design
  poster.png     the finished poster (copied from out/ when it is done)
  out/           renders and the check report; not committed
```

Start one with `python poster.py new team-day --format a3`, or ask the Poster Designer agent to.

`python poster.py build` renders and checks every poster in this folder.
