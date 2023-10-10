import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY = process.env.INFURA_API_KEY;

const config: HardhatUserConfig = {
   defaultNetwork: "hardhat",
   solidity: {
      compilers: [
         {
            version: "0.8.19",
            settings: {
               optimizer: {
                  enabled: true,
                  runs: 200,
               },
            },
         },
      ],
   },
   networks: {
      hardhat: {
         forking: {
            enabled: true,
            url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`,
         },
         chainId: 42220,
      },
   },
};

export default config;
