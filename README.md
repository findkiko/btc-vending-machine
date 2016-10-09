# btc-vending-machine
Raspberry Pi Vending Machine Hack Code


### How To Setup GPIO Pins
```
  # Change the number depending on which pin you are using (see config.js)
  echo "17" > /sys/class/gpio/export
  echo "out" > /sys/class/gpio/gpio17/direction  
```
