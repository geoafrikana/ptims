from django.conf import settings
import json

buildings_data = settings.BASE_DIR /'productionfiles'/'base'/'js'/'data.json'

def get_building_from_ptin(year, code):
    ptin_code = f'ptin/{year}/{code}'
    with open(buildings_data, 'r') as data:
        buildings = json.load(data)['data']
        for building in buildings:
            if building['ptin'] == ptin_code:
                return building
        return None