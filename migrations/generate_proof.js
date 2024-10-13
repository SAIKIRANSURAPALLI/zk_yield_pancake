const snarkjs = require("snarkjs");
const fs = require("fs");

async function generateProof(inputs) {
  // Generate proof using the provided inputs, WASM file, and ZKey
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    "./zk/circuit.wasm", // Path to the compiled circuit (WASM)
    "./zk/circuit_final.zkey" // Path to the ZKey for proof generation
  );

  console.log("Proof: ", JSON.stringify(proof, null, 1));
  console.log("Public Signals: ", JSON.stringify(publicSignals, null, 1));

  // Load the verification key and verify the proof
  const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"));
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (res) {
    console.log("Verification OK");
  } else {
    console.log("Invalid proof");
  }

  return { proof, publicSignals };
}

// Example usage
const inputs = {
  poolAddresses: ["0x1234567890123456789012345678901234567890", "0x0987654321098765432109876543210987654321"],
  amounts: [1000000, 2000000] // Specify the amounts for each pool
};

// Call the function to generate the proof
generateProof(inputs)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
y;
