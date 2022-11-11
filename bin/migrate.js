import {Users, Messages, Files} from "../models";

async function main() {
  for (const Model of [Users, Messages, Files]) {
    console.log(Model)
    await Model.sync({ alter: true });
  }

  process.exit();
}

main();