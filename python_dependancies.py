import subprocess
import sys

def main():
	install("numpy");

def install(package):
	print("Installing " + package);
	subprocess.check_call([sys.executable,"-m","pip","install",package],stdout=subprocess.PIPE,stderr=subprocess.PIPE)


main();