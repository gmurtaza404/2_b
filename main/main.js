// Node Libraries
const express = require("express")
const master_socket_server = require('http').createServer();
var body_parser = require("body-parser");
const io = require('socket.io')(master_socket_server);
var fs = require('fs');
var rimraf = require("rimraf");


// Globals
const server_port = 10001
const master_socket_port = 10002


const server_express_object = express()
server_express_object.use(body_parser.urlencoded({ extended: false }));
server_express_object.use(body_parser.json());
let currently_connected_zombies = new Map(); // map that stores the information of all zombie nodes
let job_list = new Map(); // stores information of jobs
let job_id_counter = 0 //monotonically increases with each job 




// Helper fuctions.

const create_folder = (folder_path) =>{
    if (!fs.existsSync(folder_path)){
        fs.mkdirSync(folder_path);
    }else{
        rimraf.sync(folder_path);
        fs.mkdirSync(folder_path);
    }
}


const map_to_json = (input_map) =>{
    let obj = {};

    input_map.forEach(function(value, key){
        obj[key.id] = value
    });

    return obj;
}






/*
    Firing up the routines...
*/


create_folder("./jobs")




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
        
        create_folder("./jobs/" + String(job_id_counter) )
        
        //job_list.set(job_id_counter, new Array(currently_connected_zombies.size))
        

        for (const [zombie, zombie_data] of currently_connected_zombies.entries()) {
            create_folder("./jobs/" + String(job_id_counter) + "/" + String(zombie.id) )

            zombie.emit("run_script", {
                job_id: job_id_counter, 
                script_name : req.body.script_name, 
                script_binary: req.body.script_binary,
                script_args: req.body.args 
            })

        }
        
        res.status(200).json({
            message: 'Job spawned with id=' + String(job_id_counter) + "!"
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


    server_express_object.route("/upload_file").post((req,res)=>{
       
        res.status(200).json({
           message: "File downloaded!"
       }) 
    })
    


    io.on('connection', (socket) => {
        console.log(`Client connected [id=${socket.id}]`);
        
        currently_connected_zombies.set(socket, {});
        
        socket.on("zombie_info", (data) =>{
            currently_connected_zombies.set(socket, data)
        });

        socket.on("job_status", (data)=>{
            console.log(data.message)
        });

        socket.on("stdout", (data)=>{
            file_path = "./jobs/" + String(data.job_id) + "/" + String(socket.id) + "/stdout.txt"

            fs.writeFile(file_path, data.stdout , (err) => {
                if(err) {
                    return console.log(err);
                }
            }); 
        })

        socket.on("stderr", (data)=>{
            file_path = "./jobs/" + String(data.job_id) + "/" + String(socket.id) + "/stderr.txt"

            fs.writeFile(file_path, data.stderr , (err) => {
                if(err) {
                    return console.log(err);
                }
            });
        })
        
        socket.on("disconnect", () => {
            currently_connected_zombies.delete(socket);
            console.log(`Client disconnected [id=${socket.id}]`);
        });


    });
      









    server_express_object.listen(server_port, () => console.log("Server Service Listening on port " + String(server_port)+"!"))
    master_socket_server.listen(master_socket_port, () =>console.log("Master Service Running on port "+ String(master_socket_port)+ "!"));
}






main()



















