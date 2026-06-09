// import fs from "fs/promises"
// import { exec } from "child_process"

// // function: bash
// const bash = async (path) => {
//     return new Promise((res, rej) => {
//         exec(`grep -R "${path}" .`, (err, stdout) => {
//             if (err) { rej(err);return; }
//             res(stdout);
//         })
//     })
// }
// // function: web search
// const curl = async (url) => {
//     const res = await fetch(url)
//     return await res.text()
// }
// // function: bash
// const catenate = async (path) => {
//     return new Promise((res, rej) => {
//         exec(`cat ${path}`, (err, stdout) => {
//             if (err) { rejects(err);return; }
//             res(stdout);
//         })
//     })
// }
// console.log(await catenate(".env"))

// // function: write_file
// const write_file = async (path, content) => {
//     return await fs.writeFile(path, content)
// }
// console.log(await write_file("ebola.txt", "This pandemic is rampant in DR Congo"))

// // function: read_file
// const read_file = async (path) => {
//     return await fs.readFile(path, "utf-8")
// }

// console.log(await read_file(".env"))