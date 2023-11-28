import seedrandom from "https://cdn.skypack.dev/seedrandom@3.0.5";
import nodeLzw from "https://cdn.skypack.dev/node-lzw@0.3.1";
import * as Buffer from "https://cdn.skypack.dev/buffer@6.0.3";
import stringHex from "https://cdn.skypack.dev/string-hex@1.0.0";

function test() {
  console.log("It works... right?")
}

function hex_encode(str) {
  let arr= [];
  for (let i= 0; i < str.length; i++) {
    arr[i]= ("00" + str.charCodeAt(i).toString(16).slice(-4));
  }
  return "\\u" + arr.join("\\u");
}

function hex_decode(str) {
  return unescape(str.replace(/\\/g, "%"));
}

function j_encode(in_list) {
  let json= JSON.stringify(in_list)
  //let comp= lzwCompress.pack(json)
  // let hexed= Buffer.from(json).toString('hex')
  let hexed= hex_encode(json);
  // console.log("Hx: " + hexed)
  let comp= nodeLzw.encode(hexed)
  return comp
}

function j_decode(encoded) {
  let decomp= nodeLzw.decode(encoded)
  // let parsed= Buffer.from(decomp, 'hex').toString()
  let parsed= hex_decode(decomp);
  // let decomp= lzwCompress.unpack(parsed)
  // console.log(parsed)
  let string_list= JSON.parse(parsed)
  return string_list
}

function seeded_random_list(list, seed) {
  let rng= new seedrandom(seed)
  let rng_arr= new Array()
  let rng_list= new Array()
  if (list.length == 0) return rng_list
  rng_arr[0]= rng()
  rng_list[0]= list[0]
  for (let i= 1; i < list.length; i++) {
    let r= rng()
    let j= 0
    for (j; j < rng_arr.length; j++) {
      if (r < rng_arr[j]) break;
    }
    rng_arr.splice(j, 0, r)
    rng_list.splice(j, 0, list[i])
  }
  // console.log(rng_list.join())
  return rng_list
}

function get_my_target(name_list, name) {
  name= name.toLowerCase();
  name= name.charAt(0).toUpperCase() + name.slice(1);
  name= name.replace(/\s/g, "");
  let i= name_list.indexOf(name)
  if (i === -1) return "Can you try that again? Check to make sure you're using your name as it is written in the list"
  else if (i >= name_list.length) return "Something weird is going on, Santa's code elf probably broke it..."
  else return name_list[(i + 1) % name_list.length]
}

function configure() {
  gCoded= document.getElementById("code").value
  gSeed= document.getElementById("seed").value
  console.log("configured")
  console.log("Set gCoded: " + gCoded)
  console.log("Set gSeed: " + gSeed)
  // console.log("Configured: Seed=" + seed + " Code=" + code)
}

function get_target() {
  console.log("Read gCoded: " + gCoded)
  console.log("Read gSeed: " + gSeed)
  try {
    let lList= j_decode(gCoded)
    document.getElementById("recipient").innerHTML= get_my_target(seeded_random_list(lList, gSeed), document.getElementById("name").value)
  }
  catch(err) {
    console.log(err)
    document.getElementById("recipient").innerHTML= "Invalid Code"
    return
  }

}

let gList= new Array();
let gCoded= "\\u005bĀĂ22Ć041Ċ6cĎ5Ď3ĊĈĕĐā0Ėę4aĎfĊ7Ĕę68ĕĉę2ĘćĨĂ4ąĤĒĤī0ďġ9ħėĹĜdĎčę7ĭĵģĂ7ĲŅńĚłĪĻĂ5ŉ6ĿĂ6Ľĩł5d";
let gSeed= "Carolling Nightmare Before Krampus";

const configbutton= document.getElementById("configbutton");
configbutton.addEventListener("click", configure)

const tobutton= document.getElementById("giftbutton");
tobutton.addEventListener("click", get_target)
