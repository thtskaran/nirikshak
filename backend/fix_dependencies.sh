#!/bin/bash

source myenv/bin/activate

# Uninstall conflicting bson package
pip uninstall bson -y

# Reinstall pymongo (this includes the correct bson implementation)
pip uninstall pymongo -y
pip install pymongo

# Install any other missing dependencies
pip install flask flask-cors docker requests reportlab pydantic

echo "Dependencies fixed successfully!"
