conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs
conda tos accept --override-channels --channel https://repo.anaconda.com/pkgs/msys2
conda create -n langagent python=3.13 -y
conda activate langagent
pip install -r requirements.txt