from app.routes import drills
import inspect

# Find the create_drill_from_youtube function
func = drills.create_drill_from_youtube

print("Function name:", func.__name__)
print("Function signature:", inspect.signature(func))
print("\nFunction parameters:")
for name, param in inspect.signature(func).parameters.items():
    print(f"  {name}: {param.annotation}")
