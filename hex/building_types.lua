local building_types = {
    home = {
        models = { "building_home_A_green.fbx", "building_home_A_blue.fbx" },
        cost = { stone = 2, wood = 2, tools = 1 },
        one_time = { population_limit = 1 },
        unlocked = true
    },
    field = {
        models = { "building_grain.fbx" },
        cost = { wood = 1, tools = 1 },
        per_turn = { grain = 1 },
        unlocked = true
    },
    well = {
        models = { "building_well_blue.fbx", "building_well_green.fbx" },
        cost = { stone = 2, wood = 1, tools = 1 },
        per_turn = { water = 1 },
        unlocked = true
    },
    mine = {
        models = { "building_mine_blue.fbx", "building_mine_green.fbx" },
        cost = { wood = 4, stone = 2, tools = 3 },
        per_turn = { stone = 1 }
    },
    lumbermill = {
        models = { "building_lumbermill_blue.fbx", "building_lumbermill_green.fbx" },
        cost = { stone = 1, wood = 1, tools = 1 },
        per_turn = { wood = 1 }
    },
    tavern = {
        models = { "building_tavern_blue.fbx", "building_tavern_green.fbx" },
        cost = { stone = 3, wood = 3, tools = 2 },
        one_time = { happiness = 10 }
    },
    blacksmith = {
        models = { "building_blacksmith_blue.fbx", "building_blacksmith_green.fbx" },
        cost = { stone = 3, wood = 3, tools = 3 },
        per_turn = { tools = 1 }
    },
    windmill = {
        models = { "building_windmill_blue.fbx", "building_windmill_green.fbx" },
        cost = { stone = 3, wood = 2, tools = 4 },
        per_turn = { actions = 1 }
    },
    market = {
        models = { "building_market_blue.fbx", "building_market_green.fbx" },
        cost = { stone = 5, wood = 5, tools = 5 },
    }
}

return building_types