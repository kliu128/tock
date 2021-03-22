#!/usr/bin/env node

import { execSync } from "child_process";

execSync(`./alerter -title "Chicken" -message chicken -timeout 10000`);

console.log("poglio");

// execSync("calm-notifications toggle");
