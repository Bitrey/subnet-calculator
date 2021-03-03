import express from "express";
import bodyParser from "body-parser";
import path from "path";

class Subnet {
  isValidIp(ip: any): boolean {
    if (!ip || typeof ip !== "string") return false;
    const dividedIp = ip.split(".");
    if (dividedIp.length !== 4) return false;
    for (const ipPart of dividedIp) {
      const ipPartNum = parseInt(ipPart);
      if (typeof ipPartNum !== "number") return false;
      if (ipPartNum < 0 || ipPartNum > 255) return false;
    }
    return true;
  }

  isValidHostsNum(hosts: any): boolean {
    const parsedHosts = parseInt(hosts);
    if (typeof parsedHosts !== "number") return false;
    if (parsedHosts < 0 || parsedHosts > 254) return false;
    return true;
  }

  private _getNearestPowerOf2(n: number): number {
    // if ((Math.log(n) / Math.log(2)) % 1 === 0) return n;
    return 2 << (31 - Math.clz32(n));
  }

  getNumberOfHosts(hosts: number): number {
    return this._getNearestPowerOf2(hosts + 1) - 2;
  }
}
const subnet = new Subnet();

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/valid-ip", (req, res) => {
  const { ip, host } = req.query;
  if (!subnet.isValidIp(ip)) return res.sendStatus(400);
  else if (!subnet.isValidHostsNum(host)) return res.sendStatus(400);
  console.log(`Richiesti: ${subnet.getNumberOfHosts(parseInt(host as any))}`);
  res.sendStatus(200);
});

app.listen(3000, "127.0.0.1", () => console.log("Server started"));
