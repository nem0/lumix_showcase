local world = nil
local pipeline = nil
local mesh_entity = nil
local yaw = 0

function start()
    world = Lumix.World.create()
    pipeline = LumixAPI.createPipeline()
    pipeline:setWorld(world)

    -- Create a cube entity
    mesh_entity = world:createEntityEx {
        position = {0, 0, 0},
        model_instance = { source = model_path }
    }

    -- Create directional light
    world:createEntityEx {
        name = "directional_light",
        rotation = {0, 0, 0, 1},  -- Default rotation, adjust as needed
        environment = {direct_intensity = 1.0, light_color = {1.0, 1.0, 1.0}, atmo_enabled = false}
    }

    -- Create environment probe
    world:createEntityEx {
        name = "environment_probe",
        position = {0, 0, 0},
        environment_probe = {inner_range = {10, 10, 10}, outer_range = {50, 50, 50}, enabled = true}
    }

    local viewport = {
        is_ortho = true,
        fov = 60,
        ortho_size = 1,
        w = 200,
        h = 200,
        pos = {0, 5.5, 5},
        rot = {-0.3826834323650898, 0, 0, 0.9238795325112867},
        near = 0.1,
        far = 1000,
        pixel_offset = {0, 0}
    }

    pipeline:setViewport(viewport)
    pipeline:setClearColor({1, 1, 1})
    this:createComponent("gui_render_target")
end

function update(time_delta)
    if model_path then
        -- model_path is set from outside
        mesh_entity.model_instance.source = model_path
        mesh_entity.rotation = { 0, math.sin(yaw * 0.5), 0, math.cos(yaw * 0.5) }
    end
    yaw = yaw + time_delta
    pipeline:render(false)
    local output = pipeline:getOutput()
    this.gui_render_target:setTexture(output);
end

function onDestroy()
    if world then
        world:destroy()
        world = nil
    end
end