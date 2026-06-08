import { exec } from "child_process"
exec(`cat .env`, (err, stdout, stderr) => {
    if (err) throw new Error(err)
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
})