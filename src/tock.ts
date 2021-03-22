import { emitKeypressEvents, clearLine, cursorTo } from "readline";
import { execSync } from "child_process";
import { formatDuration, addMinutes, intervalToDuration } from "date-fns";

let status: "work" | "break";
let end: Date;
let proceeding = false;
let shown = false;

function sendNotification(title: string, message: string) {
  execSync(`./alerter -title "${title}" -message "${message}" -timeout 10000`);
}

function changeStatus(s: "work" | "break") {
  status = s;
  if (status == "work") {
    console.log("POMODORO START");
    end = addMinutes(new Date(), 25);
  } else {
    console.log("BREAK START");
    end = addMinutes(new Date(), 5);
  }
  proceeding = false;
  shown = false;
}

function advanceStatus() {
  changeStatus(status == "work" ? "break" : "work");
}

changeStatus("work");

setInterval(() => {
  clearLine(process.stdout, 0);
  cursorTo(process.stdout, 0);

  if (end.getTime() < new Date().getTime()) {
    // Done. Next step
    if (!proceeding && !shown) {
      process.stdout.write("Press a to advance.");
      if (status == "work") {
        execSync("calm-notifications off");
        sendNotification("Break is starting!", "Return to break");
      } else {
        execSync("calm-notifications on");
        sendNotification("Work is starting", "Return to work");
      }
      shown = true;
    } else if (proceeding) advanceStatus();
  } else {
    process.stdout.write(
      formatDuration(intervalToDuration({ start: new Date(), end }), {
        format: ["minutes", "seconds"],
      })
    );
  }
}, 1000);

emitKeypressEvents(process.stdin.setRawMode(true));

process.stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name == "c") {
    changeStatus("break");
    process.exit();
  }
  if (key.name == "s") {
    console.log("Skipping.");
    advanceStatus();
  }
  if (key.name == "a") {
    proceeding = true;
  }
});
