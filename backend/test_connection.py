import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        try:
            # Test equipment endpoint
            r = await client.get('http://localhost:8000/api/equipment')
            print(f'Equipment Status: {r.status_code}')
            if r.status_code == 200:
                print(f'Equipment Data: {r.text[:200]}')

            # Test drills endpoint
            r = await client.get('http://localhost:8000/api/drills')
            print(f'Drills Status: {r.status_code}')
            if r.status_code == 200:
                print(f'Drills Data: {r.text[:200]}')

            print("\nDatabase connectivity restored successfully!")
        except Exception as e:
            print(f'Error: {e}')

asyncio.run(test())
