import express from "express";
import bodyParser from "body-parser";
import path from "path";

class Network {
  // 192.168.0
  baseIp: string;

  // 0
  startIp: number;

  // 254
  mask: number;

  constructor(baseIp: string, startIp: number, mask: number) {
    this.baseIp = baseIp;
    this.startIp = startIp;
    this.mask = mask;
  }
}

class NetworkManager {
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

  private _roundPowerOf2(n: number): number {
    // if ((Math.log(n) / Math.log(2)) % 1 === 0) return n;
    return 2 << (31 - Math.clz32(n));
  }

  private _floorPowerOf2(n: number): number {
    // if ((Math.log(n) / Math.log(2)) % 1 === 0) return n;
    return 2 << (31 - Math.clz32(n));
  }

  getNumberOfHosts(hosts: number): number {
    return this._floorPowerOf2(hosts + 1) - 2;
  }

  getMask(hosts: number) {
    const index = Math.log2(this.getNumberOfHosts(hosts) + 2);
    let str = "11111111";
    for (let i = 0; i < index; i++) {
      str = NetworkManager._replaceAt(str, i, "0");
    }
    const reversed = str.split("").reverse().join("");
    const subnet = parseInt(reversed, 2);
    return subnet;
  }

  static _replaceAt(str: string, i: number, str2: string) {
    return str.substr(0, i) + str2 + str.substr(i + str2.length);
  }

  getFirstIp(ip: string, hosts: number) {
    // 64
    const netLength = hosts + 2;

    // 192.168.0.*100*
    const hostIp = parseInt(ip.split(".")[3]);

    if (hostIp === netLength) return hostIp;

    let currentIp = 0;
    while (Math.abs(currentIp - netLength) > netLength) {
      currentIp += netLength;
    }
    return currentIp;
  }
}
const networkManager = new NetworkManager();

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
  const hostsNum = parseInt(host as any);
  if (!networkManager.isValidIp(ip)) return res.sendStatus(400);
  else if (!networkManager.isValidHostsNum(host)) return res.sendStatus(400);
  console.log(`\nIp: ${ip}`);
  const actualHosts = networkManager.getNumberOfHosts(hostsNum);
  console.log(`Richiesti: ${actualHosts}`);
  console.log(`Subnet: 255.255.255.${networkManager.getMask(hostsNum)}`);
  console.log(
    "PRIMO IP = " + networkManager.getFirstIp((<any>ip) as string, actualHosts)
  );
  res.sendStatus(200);
});

app.listen(3000, "127.0.0.1", () => console.log("Server started"));
