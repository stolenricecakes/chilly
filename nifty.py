import random

i = 68.0
w = 209.0
o = 198.0



for count in range(0, 1000):
        wDiff = random.uniform(-.3,.05)
        oDiff = random.uniform(-.3,.05)
        iDiff = random.uniform(-.01, 0)
	w = w + wDiff;
	o = o + oDiff;
	i = i + iDiff;
	print ("{\"millis\": %d, \"h2oin\": %.2f, \"h2oout\": %.2f, \"wort\": %.2f},") % ( (count * 450), i, o, w)


