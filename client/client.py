import sys,requests, argparse, json
import os.path




SUBMIT_JOB_URL = "http://23.105.132.122:10001/job"



def get_file_name(path_to_file):
    return path_to_file.split("/")[-1]




def make_data_packet(file_name, path_to_file,args = []):
    return {
        'script_name' : file_name,
        'script_binary' : open(path_to_file, "rb").read(),
        'args' : args
    }


def make_request_submit_job(data):
    return requests.post(url = SUBMIT_JOB_URL, data=data)


def main():
    parser = argparse.ArgumentParser(description='Sends a request to the Main, and prints response')
    parser.add_argument('--submit_job', dest='action', action='store_const', const="submit_job", default="error", help='Submits a job request to the Main, needs --file flag with a path to valid file')
    parser.add_argument('--job_status', dest='action', action='store_const', const="job_status", default="error", help='Submits a request to Main to check status of a job, needs --job_id flag with a valid job_id')
    parser.add_argument('--file', dest="file", help='Path to file, required flag for submit_job')
    parser.add_argument('--job_id', dest="job_id", type=int, help='Id of job, required for job_status.')
    
    args = parser.parse_args()
    
    if args.action == "submit_job":
        print "submitting a job..."
        if args.file != None and os.path.isfile(args.file):
            file_name = get_file_name(args.file)
            if ".py" not in file_name and ".sh" not in file_name:
                print "Invalid file format ..."
            else:
                data_packet = make_data_packet(file_name, args.file)
                try:
                    response_data = make_request_submit_job(data_packet)
                    print json.loads(response_data.text)["message"]

                except:
                    print "failed to establish a connection with Main"
        
        else:
            print "Invalid file input ..."

    elif args.action == "job_status":
        print "requesting status of a job..."

    else:
        print "Invalid Input"





main()

