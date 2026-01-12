1) Track exactly these 7 raw stats (per player)

Let PA be total plate appearances.

PA = Plate Appearances

H = Hits

BB = Walks

SO = Strikeouts

XBH = Extra-base hits (2B + 3B + HR)

ROE = Reached on error

SPD = Speed grade (0–10) or home-to-1st time converted to 0–10

That’s it.

2) Derived metrics (formulas)

These are the only computed metrics you need.

A) On-base rate (youth-friendly)

Youth scoring has lots of errors, so include ROE:

OBR (On-Base Rate)

OBR
=
𝐻
+
𝐵
𝐵
+
𝑅
𝑂
𝐸
𝑃
𝐴
OBR=
PA
H+BB+ROE
	​

B) Ball-in-play rate (avoid strikeout “dead” at-bats)

BIP (Ball In Play rate)

BIP
=
1
−
𝑆
𝑂
𝑃
𝐴
BIP=1−
PA
SO
	​

C) Power rate (simple)

PWR (Power rate)

PWR
=
𝑋
𝐵
𝐻
𝑃
𝐴
PWR=
PA
XBH
	​

D) Normalization (so you can combine metrics)

For any metric 
𝑀
M (OBR, BIP, PWR), normalize across the roster:

Min–Max Normalized 
𝑀
M

𝑀
𝑛
𝑜
𝑟
𝑚
=
𝑀
−
min
⁡
(
𝑀
)
max
⁡
(
𝑀
)
−
min
⁡
(
𝑀
)
+
𝜖
M
norm
	​

=
max(M)−min(M)+ϵ
M−min(M)
	​


Use 
𝜖
=
10
−
9
ϵ=10
−9
 to avoid division by zero if everyone is identical.

For SPD, if you already store it as 0–10:

𝑆
𝑃
𝐷
𝑛
𝑜
𝑟
𝑚
=
𝑆
𝑃
𝐷
10
SPD
norm
	​

=
10
SPD
	​

3) Role scores (slot-specific formulas)

Define scores for key lineup slots using the normalized metrics.

Let:

𝑜
=
𝑂
𝐵
𝑅
𝑛
𝑜
𝑟
𝑚
o=OBR
norm
	​


𝑐
=
𝐵
𝐼
𝑃
𝑛
𝑜
𝑟
𝑚
c=BIP
norm
	​

 (think “contact/ball-in-play”)

𝑝
=
𝑃
𝑊
𝑅
𝑛
𝑜
𝑟
𝑚
p=PWR
norm
	​


𝑠
=
𝑆
𝑃
𝐷
𝑛
𝑜
𝑟
𝑚
s=SPD
norm
	​


Slot score formulas

These weights are MVP-friendly and youth-appropriate (on-base + contact > power).

Leadoff score (Slot 1)

𝑆
1
=
0.50
𝑜
+
0.35
𝑠
+
0.15
𝑐
S
1
	​

=0.50o+0.35s+0.15c

2-hole score (Slot 2)

𝑆
2
=
0.45
𝑐
+
0.45
𝑜
+
0.10
𝑠
S
2
	​

=0.45c+0.45o+0.10s

3-hole score (Slot 3) (best overall hitter)

𝑆
3
=
0.45
𝑜
+
0.30
𝑐
+
0.25
𝑝
S
3
	​

=0.45o+0.30c+0.25p

Cleanup score (Slot 4)

𝑆
4
=
0.55
𝑝
+
0.30
𝑜
+
0.15
𝑐
S
4
	​

=0.55p+0.30o+0.15c

5-hole score (Slot 5)

𝑆
5
=
0.45
𝑝
+
0.35
𝑜
+
0.20
𝑐
S
5
	​

=0.45p+0.35o+0.20c

Middle score (Slots 6–7) (keep innings alive)

𝑆
𝑚
𝑖
𝑑
=
0.45
𝑜
+
0.40
𝑐
+
0.15
𝑠
S
mid
	​

=0.45o+0.40c+0.15s

Bottom score (Slots 8–9) (development but still “turn it over”)
For slot 9 (second leadoff):

𝑆
9
=
0.45
𝑜
+
0.35
𝑠
+
0.20
𝑐
S
9
	​

=0.45o+0.35s+0.20c

For slot 8 (least harmful, avoid automatic outs):

𝑆
8
=
0.40
𝑐
+
0.40
𝑜
+
0.20
𝑠
S
8
	​

=0.40c+0.40o+0.20s

(If you bat 10, treat slot 10 like slot 8.)

4) Exactly what to calculate (pipeline)

For each player:

Compute OBR, BIP, PWR using the formulas above.

Compute OBR_norm, BIP_norm, PWR_norm using min–max normalization across roster.

Compute SPD_norm.

Compute the slot scores: 
𝑆
1
,
𝑆
2
,
𝑆
3
,
𝑆
4
,
𝑆
5
,
𝑆
𝑚
𝑖
𝑑
,
𝑆
8
,
𝑆
9
S
1
	​

,S
2
	​

,S
3
	​

,S
4
	​

,S
5
	​

,S
mid
	​

,S
8
	​

,S
9
	​

.

That’s the full computation layer.

5) Choosing the “optimal” lineup (deterministic optimization)

You want the lineup that maximizes total slot-fit.

A) Define the objective

For a 9-batter lineup, define the total lineup score:

TotalScore
=
𝑆
1
(
player at 1
)
+
𝑆
2
(
player at 2
)
+
𝑆
3
(
player at 3
)
+
𝑆
4
(
player at 4
)
+
𝑆
5
(
player at 5
)
+
𝑆
𝑚
𝑖
𝑑
(
player at 6
)
+
𝑆
𝑚
𝑖
𝑑
(
player at 7
)
+
𝑆
8
(
player at 8
)
+
𝑆
9
(
player at 9
)
TotalScore=S
1
	​

(player at 1)+S
2
	​

(player at 2)+S
3
	​

(player at 3)+S
4
	​

(player at 4)+S
5
	​

(player at 5)+S
mid
	​

(player at 6)+S
mid
	​

(player at 7)+S
8
	​

(player at 8)+S
9
	​

(player at 9)

Goal: choose a permutation of players that maximizes TotalScore.

B) How to solve it (two MVP options)
Option 1 (super MVP): brute force with pruning

With 9 players, worst-case permutations = 9! = 362,880 (totally fine).
With 10 players, 10! = 3.6M (still fine on a phone with basic pruning/caching).

Algorithm:

Generate all permutations of batting order.

Compute TotalScore for each.

Keep the max.

Pruning (optional):

Fix the best cleanup candidate in #4 first (top few) to cut search space.

Option 2 (clean/standard): assignment problem (recommended)

Create a matrix where:

Rows = players

Columns = slots 1..9

Cell value = that player’s score for that slot (use the correct 
𝑆
𝑘
S
k
	​

 formula)

Then solve “max weight matching” / Hungarian algorithm to assign players to slots maximizing total score.

This is the “optimal lineup” in a precise, explainable sense.

Slot scoring matrix values

Col 1 uses 
𝑆
1
S
1
	​


Col 2 uses 
𝑆
2
S
2
	​


Col 3 uses 
𝑆
3
S
3
	​


Col 4 uses 
𝑆
4
S
4
	​


Col 5 uses 
𝑆
5
S
5
	​


Col 6 uses 
𝑆
𝑚
𝑖
𝑑
S
mid
	​


Col 7 uses 
𝑆
𝑚
𝑖
𝑑
S
mid
	​


Col 8 uses 
𝑆
8
S
8
	​


Col 9 uses 
𝑆
9
S
9
	​


If roster > 9 and everyone bats (continuous batting), just extend slot types:

10 → add another 
𝑆
8
S
8
	​

-type slot

11+ → keep adding 
𝑆
8
S
8
	​

-type slots

6) Tie-breakers (so output is stable)

If two lineups have equal TotalScore (possible), break ties deterministically:

Higher sum of OBR_norm in slots 1–5

Higher PWR_norm in slot 4

Lexicographic by player id (or name)