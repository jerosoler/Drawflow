# Drawflow

## Events
nodeCreated return id;
nodeRemoved return id;
nodeSelected return id;

connectionCreated return { ouput_id, input_id, ouput_class, input_class }
connectionRemoved return { ouput_id, input_id, ouput_class, input_class }

moduleCreated return name
moduleChanged return name 

mouseMove return {x, y}
zoom retrun zoom_level
translate return {x, y}
