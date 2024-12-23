// SimpleScript
// 21 december 2024
// Thomas Doomernik
// Versie: 0.1

const fs = require("fs");

let variabelen = {};
let regelTeller = 0;

// krijg de source code
const path = "main.ss";
function getCode(path) {
    try {
        const data = fs.readFileSync(path, "utf-8");
        return data;
    } catch {
        throw new Error("FOUT: kan het bestand niet openen/laden");
    }
}

let code = getCode(path);

// opsplitten
function opsplitter(code) {
    const lijnen = code.split(/\n|;/);
    let opsplitLijnen = [];
    const regex = /\s*(\d+\.\d*|\d+|\w+|[+\-*/=])\s*/g;
    for (let i = 0; i < lijnen.length; i++) {
        let opgesplitsteLijn = lijnen[i].match(regex) || [];
        let opgesplitsteGetrimdeLijn = [];
        for (let j = 0; j < opgesplitsteLijn.length; j++) {
            opgesplitsteGetrimdeLijn.push(opgesplitsteLijn[j].trim());
        }

        if (opgesplitsteGetrimdeLijn.length >= 1) {
            opsplitLijnen.push(opgesplitsteGetrimdeLijn);
        }
    }

    return opsplitLijnen;
}

// variabelen
function isVar(waarde) {
    if (variabelen.hasOwnProperty(waarde)) {
        return variabelen[waarde];
    } else {
        return waarde;
    }
}

function defVar(lijn) {
    if (lijn[0] == "var") {
        if (lijn.length >= 4) {
            if (lijn[2] == "=") {
                let waarde = "";
                for (let i = 3; i < lijn.length; i++) {
                    waarde += isVar(lijn[i]);
                }

                try {
                    variabelen[lijn[1]] = eval(waarde);
                } catch { // voor een string
                    variabelen[lijn[1]] = waarde.toString();
                }
            } else {
                throw new Error(`FOUT: de '=' staat niet op de juiste plek of is niet benoemd bij de variabele definitie in regel ${regelTeller}`);
            }
        } else {
            throw new Error(`FOUT: niet genoeg argumenten opgegeven voor var in regel ${regelTeller}`);
        }
    }
}

// out functie
function out(lijn) {
    if (lijn[0] == "out") {
        if (lijn.length >= 2) {
            let waarde = "";
            for (let i = 1; i < lijn.length; i++) {
                waarde += isVar(lijn[i]);
            }

            try {
                console.log(eval(waarde));
            } catch { // voor een string
                console.log(waarde);
            }
        } else {
            throw new Error(`FOUT: niet genoeg argumenten opgegeven voor out in regel ${regelTeller}`);
        }
    }
}

// loops
function loop(lijn) {
    if (lijn[0] == "loop") {
        if (lijn.length >= 2) {
            let waarde = "";
            for (let i = 1; i < lijn.length; i++) {
                waarde += isVar(lijn[i]);
            }

            try {
                waarde = eval(waarde);
            } catch {
                throw new Error(`FOUT: ongeldige argumenten voor loop in regel ${regelTeller}`);
            }

            let loopStartRegel = regelTeller;
            let opgesplitsteCode = opsplitter(code);
            let loopRegelTeller = loopStartRegel;

            for (let _ = 1; _ < waarde; _++) {
                for (let i = loopStartRegel; i < opgesplitsteCode.length; i++) {   
                    loopRegelTeller++;                 
                    if (opgesplitsteCode[i][0] == "next") {
                        if (opgesplitsteCode[i].length == 1) {
                            loopRegelTeller = loopStartRegel;
                        } else {
                            throw new Error(`FOUT: next heeft geen argumenten nodig in regel ${loopRegelTeller}`);
                        }
                    }

                    main(opgesplitsteCode[i]);
                }
            }
        } else {
            throw new Error(`FOUT: niet genoeg argumenten opgegeven voor loop in regel ${regelTeller}`);
        }
    }
}

// hoofdloop
function main(lijn) {
    defVar(lijn);
    out(lijn);
    loop(lijn);
}

for (let lijn of opsplitter(code)) {
    regelTeller++;
    main(lijn);
}