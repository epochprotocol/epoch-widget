import type { OneDeltaConfig } from '../types';

/**
 * Hardcoded subset of the 1delta `/earn/markets/by-config` response. The full
 * 1delta dataset has 63+ configs; we ship a curated slice here so the widget
 * works end-to-end without a backend call. Swap in the full upstream payload
 * by passing your own array to `<EpochIntentWidget earnMarketsSource={...} />`.
 */
export const HARDCODED_ONEDELTA_CONFIGS: OneDeltaConfig[] = [
  {
    "lenderKey": "AAVE_V3",
    "chainId": "8453",
    "configId": "0",
    "label": "Disabled",
    "category": "0",
    "collaterals": [
      {
        "marketUid": "AAVE_V3:8453:0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
        "depositRate": 0.00055669,
        "utilization": 0.030958376814599384,
        "borrowFactor": 1,
        "totalDebtUsd": 1107201.191095234,
        "intrinsicYield": 2.2068,
        "totalLiquidity": 12282.840703597523,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped liquid staked Ether 2.0",
            "props": null,
            "symbol": "wstETH",
            "address": "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/18834/large/wstETH.png?1633565443",
            "decimals": 18,
            "assetGroup": "WSTETH",
            "currencyId": "Wrapped liquid staked Ether 2.0::wstETH",
            "intrinsicYield": 2.2068
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2743.68074458,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2836.61962992
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2743.68074458,
            "oraclePriceUsd": 2743.68074458
          }
        },
        "borrowLiquidity": 807.5949647987972,
        "collateralFactor": 0.79,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 35764187.43546977,
        "totalLiquidityUsd": 34656986.116610646,
        "borrowLiquidityUsd": 2278691.7259847657,
        "variableBorrowRate": 0.01891698,
        "borrowCollateralFactor": 0.75
      },
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "depositRate": 3.08230254,
        "utilization": 0.8340421828067578,
        "borrowFactor": 1,
        "totalDebtUsd": 152830814.8920707,
        "intrinsicYield": null,
        "totalLiquidity": 30418122.225042,
        "underlyingInfo": {
          "asset": {
            "name": "USD Coin",
            "props": {
              "permit": {
                "type": 1,
                "version": "2"
              }
            },
            "symbol": "USDC",
            "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
            "decimals": 6,
            "assetGroup": "USDC",
            "currencyId": "USD Coin::USDC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 0.99977056,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 0.99996012
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 1
          },
          "oraclePrice": {
            "oraclePrice": 0.99977056,
            "oraclePriceUsd": 0.99977056
          }
        },
        "borrowLiquidity": 30418122.225042,
        "collateralFactor": 0.78,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 183241109.43376663,
        "totalLiquidityUsd": 30411127.882017575,
        "borrowLiquidityUsd": 30411127.882017575,
        "variableBorrowRate": 4.08558871,
        "borrowCollateralFactor": 0.75
      },
      {
        "marketUid": "AAVE_V3:8453:0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        "depositRate": 0.04309626,
        "utilization": 0.0570972911248171,
        "borrowFactor": 1,
        "totalDebtUsd": 565328.6621407572,
        "intrinsicYield": 2.60965393,
        "totalLiquidity": 3614.0238108901835,
        "underlyingInfo": {
          "asset": {
            "name": "Coinbase Wrapped Staked ETH",
            "props": null,
            "symbol": "cbETH",
            "address": "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/cbETH/logo.svg",
            "decimals": 18,
            "assetGroup": "CBETH",
            "currencyId": "Coinbase Wrapped Staked ETH::cbETH",
            "intrinsicYield": 2.60965393
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2511.74174808,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2596.81582335
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2511.74174808,
            "oraclePriceUsd": 2511.74174808
          }
        },
        "borrowLiquidity": 791.1534946607529,
        "collateralFactor": 0.79,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 9901146.814564718,
        "totalLiquidityUsd": 9335818.466866717,
        "borrowLiquidityUsd": 2043723.5037919427,
        "variableBorrowRate": 0.8842587,
        "borrowCollateralFactor": 0.75
      },
      {
        "marketUid": "AAVE_V3:8453:0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
        "depositRate": 0.00004061,
        "utilization": 0.0000733064824204705,
        "borrowFactor": 1,
        "totalDebtUsd": 6819.2744616775,
        "intrinsicYield": 2.7068,
        "totalLiquidity": 37174.04379236691,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped eETH",
            "props": null,
            "symbol": "weETH",
            "address": "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/33033/thumb/weETH.png?1701438396",
            "decimals": 18,
            "assetGroup": "WEETH",
            "currencyId": "Wrapped eETH::weETH",
            "intrinsicYield": 2.7068
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2433.10149321,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2515.53559903
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2433.10149321,
            "oraclePriceUsd": 2433.10149321
          }
        },
        "borrowLiquidity": 0,
        "collateralFactor": 0.77,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 93024166.98380935,
        "totalLiquidityUsd": 93017347.72546856,
        "borrowLiquidityUsd": 0,
        "variableBorrowRate": 0.99672633,
        "borrowCollateralFactor": 0.75
      },
      {
        "marketUid": "AAVE_V3:8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "depositRate": 0.02182578,
        "utilization": 0.055977995665030346,
        "borrowFactor": 1,
        "totalDebtUsd": 9416482.65343047,
        "intrinsicYield": null,
        "totalLiquidity": 1962.37121361,
        "underlyingInfo": {
          "asset": {
            "name": "Coinbase Wrapped BTC",
            "props": null,
            "symbol": "cbBTC",
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
            "decimals": 8,
            "assetGroup": "CBBTC",
            "currencyId": "Coinbase Wrapped BTC::cbBTC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 79067.82373177,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 81459.94149972
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 79067.82373177,
            "oraclePriceUsd": 79067.82373177
          }
        },
        "borrowLiquidity": 263.63712674,
        "collateralFactor": 0.78,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 168217574.45154434,
        "totalLiquidityUsd": 158801806.58019152,
        "borrowLiquidityUsd": 21334420.17369673,
        "variableBorrowRate": 0.77686361,
        "borrowCollateralFactor": 0.73
      }
    ],
    "borrowables": [
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "depositRate": 3.08230254,
        "utilization": 0.8340421828067578,
        "borrowFactor": 1,
        "totalDebtUsd": 152830814.8920707,
        "intrinsicYield": null,
        "totalLiquidity": 30418122.225042,
        "underlyingInfo": {
          "asset": {
            "name": "USD Coin",
            "props": {
              "permit": {
                "type": 1,
                "version": "2"
              }
            },
            "symbol": "USDC",
            "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
            "decimals": 6,
            "assetGroup": "USDC",
            "currencyId": "USD Coin::USDC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 0.99977056,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 0.99996012
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 1
          },
          "oraclePrice": {
            "oraclePrice": 0.99977056,
            "oraclePriceUsd": 0.99977056
          }
        },
        "borrowLiquidity": 30418122.225042,
        "collateralFactor": 0.78,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 183241109.43376663,
        "totalLiquidityUsd": 30411127.882017575,
        "borrowLiquidityUsd": 30411127.882017575,
        "variableBorrowRate": 4.08558871,
        "borrowCollateralFactor": 0.75
      },
      {
        "marketUid": "AAVE_V3:8453:0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
        "depositRate": 1.72991318,
        "utilization": 0.48235126061207456,
        "borrowFactor": 1,
        "totalDebtUsd": 5060601.041682856,
        "intrinsicYield": null,
        "totalLiquidity": 4651349.804196,
        "underlyingInfo": {
          "asset": {
            "name": "Euro Coin",
            "props": null,
            "symbol": "EURC",
            "address": "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/26045/standard/euro.png",
            "decimals": 6,
            "assetGroup": "EURC",
            "currencyId": "Euro Coin::EURC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 1.1620751,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 1.16787373
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 1.1620751,
            "oraclePriceUsd": 1.1620751
          }
        },
        "borrowLiquidity": 4651349.804196,
        "collateralFactor": 0.78,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 10491526.51795967,
        "totalLiquidityUsd": 5430947.195422938,
        "borrowLiquidityUsd": 5430947.195422938,
        "variableBorrowRate": 3.94090095,
        "borrowCollateralFactor": 0
      },
      {
        "marketUid": "AAVE_V3:8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "depositRate": 0.02182578,
        "utilization": 0.055977995665030346,
        "borrowFactor": 1,
        "totalDebtUsd": 9416482.65343047,
        "intrinsicYield": null,
        "totalLiquidity": 1962.37121361,
        "underlyingInfo": {
          "asset": {
            "name": "Coinbase Wrapped BTC",
            "props": null,
            "symbol": "cbBTC",
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
            "decimals": 8,
            "assetGroup": "CBBTC",
            "currencyId": "Coinbase Wrapped BTC::cbBTC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 79067.82373177,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 81459.94149972
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 79067.82373177,
            "oraclePriceUsd": 79067.82373177
          }
        },
        "borrowLiquidity": 263.63712674,
        "collateralFactor": 0.78,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 168217574.45154434,
        "totalLiquidityUsd": 158801806.58019152,
        "borrowLiquidityUsd": 21334420.17369673,
        "variableBorrowRate": 0.77686361,
        "borrowCollateralFactor": 0.73
      },
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "depositRate": 7.60956194,
        "utilization": 0.910308431683843,
        "borrowFactor": 1,
        "totalDebtUsd": 1936171.1105309497,
        "intrinsicYield": null,
        "totalLiquidity": 190784.47512063294,
        "underlyingInfo": {
          "asset": {
            "name": "GHO Token",
            "props": null,
            "symbol": "GHO",
            "address": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/30663/thumb/gho-token-logo.png?1720517092",
            "decimals": 18,
            "assetGroup": "GHO",
            "currencyId": "GHO Token::GHO",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 1,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 1
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 1,
            "oraclePriceUsd": 1
          }
        },
        "borrowLiquidity": 190784.47512063294,
        "collateralFactor": 0,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 2126939.6647788016,
        "totalLiquidityUsd": 190784.4751206329,
        "borrowLiquidityUsd": 190784.4751206329,
        "variableBorrowRate": 9.2130055,
        "borrowCollateralFactor": 0
      },
      {
        "marketUid": "AAVE_V3:8453:0x4200000000000000000000000000000000000006",
        "depositRate": 1.34415174,
        "utilization": 0.9158850558978114,
        "borrowFactor": 1,
        "totalDebtUsd": 160506659.81866443,
        "intrinsicYield": null,
        "totalLiquidity": 6448.9713205827875,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped Ether",
            "props": {
              "wnative": true
            },
            "symbol": "WETH",
            "address": "0x4200000000000000000000000000000000000006",
            "chainId": "8453",
            "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
            "decimals": 18,
            "assetGroup": "ETH",
            "currencyId": "Wrapped Ether::WETH",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2222.43601709,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2297.87
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2222.43601709,
            "oraclePriceUsd": 2222.43601709
          }
        },
        "borrowLiquidity": 6448.9713205827875,
        "collateralFactor": 0.83,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 175247602.07090086,
        "totalLiquidityUsd": 14741312.089161035,
        "borrowLiquidityUsd": 14741312.089161035,
        "variableBorrowRate": 1.72331202,
        "borrowCollateralFactor": 0
      }
    ],
    "chainRiskScore": 2,
    "lenderRiskScore": 1,
    "maxTokenRiskScore": 2,
    "configRiskScore": 2,
    "configRiskLabel": "low",
    "tokenRisks": [
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 5,
        "tokenRiskScores": {
          "label": "GHO",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 2,
          "assetGroup": "GHO",
          "isDepegged": false,
          "qualityScore": 0.85
        },
        "underlyingAddress": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee"
      },
      {
        "marketUid": "AAVE_V3:8453:0x4200000000000000000000000000000000000006",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped Ether",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "ETH"
        },
        "underlyingAddress": "0x4200000000000000000000000000000000000006"
      },
      {
        "marketUid": "AAVE_V3:8453:0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Coinbase Wrapped Staked ETH",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "CBETH"
        },
        "underlyingAddress": "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22"
      },
      {
        "marketUid": "AAVE_V3:8453:0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped liquid staked Ether 2.0",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "WSTETH"
        },
        "underlyingAddress": "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452"
      },
      {
        "marketUid": "AAVE_V3:8453:0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped eETH",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "WEETH"
        },
        "underlyingAddress": "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a"
      },
      {
        "marketUid": "AAVE_V3:8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Coinbase Wrapped BTC",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "CBBTC"
        },
        "underlyingAddress": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"
      },
      {
        "marketUid": "AAVE_V3:8453:0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "EURC",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 2,
          "assetGroup": "EURC",
          "isDepegged": false,
          "qualityScore": 0.85
        },
        "underlyingAddress": "0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42"
      },
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 1,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "USD Coin",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 1,
          "assetGroup": "USDC",
          "isDepegged": false,
          "qualityScore": 1
        },
        "underlyingAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
      }
    ]
  },
  {
    "lenderKey": "AAVE_V3",
    "chainId": "8453",
    "configId": "1",
    "label": "ETH correlated",
    "category": "1",
    "collaterals": [
      {
        "marketUid": "AAVE_V3:8453:0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
        "depositRate": 0.00055669,
        "utilization": 0.030958376814599384,
        "borrowFactor": 1,
        "totalDebtUsd": 1107201.191095234,
        "intrinsicYield": 2.2068,
        "totalLiquidity": 12282.840703597523,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped liquid staked Ether 2.0",
            "props": null,
            "symbol": "wstETH",
            "address": "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/18834/large/wstETH.png?1633565443",
            "decimals": 18,
            "assetGroup": "WSTETH",
            "currencyId": "Wrapped liquid staked Ether 2.0::wstETH",
            "intrinsicYield": 2.2068
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2743.68074458,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2836.61962992
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2743.68074458,
            "oraclePriceUsd": 2743.68074458
          }
        },
        "borrowLiquidity": 807.5949647987972,
        "collateralFactor": 0.93,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 35764187.43546977,
        "totalLiquidityUsd": 34656986.116610646,
        "borrowLiquidityUsd": 2278691.7259847657,
        "variableBorrowRate": 0.01891698,
        "borrowCollateralFactor": 0.9
      },
      {
        "marketUid": "AAVE_V3:8453:0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        "depositRate": 0.04309626,
        "utilization": 0.0570972911248171,
        "borrowFactor": 1,
        "totalDebtUsd": 565328.6621407572,
        "intrinsicYield": 2.60965393,
        "totalLiquidity": 3614.0238108901835,
        "underlyingInfo": {
          "asset": {
            "name": "Coinbase Wrapped Staked ETH",
            "props": null,
            "symbol": "cbETH",
            "address": "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/cbETH/logo.svg",
            "decimals": 18,
            "assetGroup": "CBETH",
            "currencyId": "Coinbase Wrapped Staked ETH::cbETH",
            "intrinsicYield": 2.60965393
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2511.74174808,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2596.81582335
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2511.74174808,
            "oraclePriceUsd": 2511.74174808
          }
        },
        "borrowLiquidity": 791.1534946607529,
        "collateralFactor": 0.93,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 9901146.814564718,
        "totalLiquidityUsd": 9335818.466866717,
        "borrowLiquidityUsd": 2043723.5037919427,
        "variableBorrowRate": 0.8842587,
        "borrowCollateralFactor": 0.9
      },
      {
        "marketUid": "AAVE_V3:8453:0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
        "depositRate": 0.00004061,
        "utilization": 0.0000733064824204705,
        "borrowFactor": 1,
        "totalDebtUsd": 6819.2744616775,
        "intrinsicYield": 2.7068,
        "totalLiquidity": 37174.04379236691,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped eETH",
            "props": null,
            "symbol": "weETH",
            "address": "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/33033/thumb/weETH.png?1701438396",
            "decimals": 18,
            "assetGroup": "WEETH",
            "currencyId": "Wrapped eETH::weETH",
            "intrinsicYield": 2.7068
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2433.10149321,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2515.53559903
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2433.10149321,
            "oraclePriceUsd": 2433.10149321
          }
        },
        "borrowLiquidity": 0,
        "collateralFactor": 0.93,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 93024166.98380935,
        "totalLiquidityUsd": 93017347.72546856,
        "borrowLiquidityUsd": 0,
        "variableBorrowRate": 0.99672633,
        "borrowCollateralFactor": 0.9
      },
      {
        "marketUid": "AAVE_V3:8453:0x4200000000000000000000000000000000000006",
        "depositRate": 1.34415174,
        "utilization": 0.9158850558978114,
        "borrowFactor": 1,
        "totalDebtUsd": 160506659.81866443,
        "intrinsicYield": null,
        "totalLiquidity": 6448.9713205827875,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped Ether",
            "props": {
              "wnative": true
            },
            "symbol": "WETH",
            "address": "0x4200000000000000000000000000000000000006",
            "chainId": "8453",
            "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
            "decimals": 18,
            "assetGroup": "ETH",
            "currencyId": "Wrapped Ether::WETH",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2222.43601709,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2297.87
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2222.43601709,
            "oraclePriceUsd": 2222.43601709
          }
        },
        "borrowLiquidity": 6448.9713205827875,
        "collateralFactor": 0.93,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 175247602.07090086,
        "totalLiquidityUsd": 14741312.089161035,
        "borrowLiquidityUsd": 14741312.089161035,
        "variableBorrowRate": 1.72331202,
        "borrowCollateralFactor": 0.9
      }
    ],
    "borrowables": [
      {
        "marketUid": "AAVE_V3:8453:0x4200000000000000000000000000000000000006",
        "depositRate": 1.34415174,
        "utilization": 0.9158850558978114,
        "borrowFactor": 1,
        "totalDebtUsd": 160506659.81866443,
        "intrinsicYield": null,
        "totalLiquidity": 6448.9713205827875,
        "underlyingInfo": {
          "asset": {
            "name": "Wrapped Ether",
            "props": {
              "wnative": true
            },
            "symbol": "WETH",
            "address": "0x4200000000000000000000000000000000000006",
            "chainId": "8453",
            "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
            "decimals": 18,
            "assetGroup": "ETH",
            "currencyId": "Wrapped Ether::WETH",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 2222.43601709,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 2297.87
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 2222.43601709,
            "oraclePriceUsd": 2222.43601709
          }
        },
        "borrowLiquidity": 6448.9713205827875,
        "collateralFactor": 0.93,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 175247602.07090086,
        "totalLiquidityUsd": 14741312.089161035,
        "borrowLiquidityUsd": 14741312.089161035,
        "variableBorrowRate": 1.72331202,
        "borrowCollateralFactor": 0.9
      }
    ],
    "chainRiskScore": 2,
    "lenderRiskScore": 1,
    "maxTokenRiskScore": 2,
    "configRiskScore": 2,
    "configRiskLabel": "low",
    "tokenRisks": [
      {
        "marketUid": "AAVE_V3:8453:0x4200000000000000000000000000000000000006",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped Ether",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "ETH"
        },
        "underlyingAddress": "0x4200000000000000000000000000000000000006"
      },
      {
        "marketUid": "AAVE_V3:8453:0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Coinbase Wrapped Staked ETH",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "CBETH"
        },
        "underlyingAddress": "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22"
      },
      {
        "marketUid": "AAVE_V3:8453:0x04c0599ae5a44757c0af6f9ec3b93da8976c150a",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped eETH",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "WEETH"
        },
        "underlyingAddress": "0x04c0599ae5a44757c0af6f9ec3b93da8976c150a"
      },
      {
        "marketUid": "AAVE_V3:8453:0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Wrapped liquid staked Ether 2.0",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "WSTETH"
        },
        "underlyingAddress": "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452"
      }
    ]
  },
  {
    "lenderKey": "AAVE_V3",
    "chainId": "8453",
    "configId": "10",
    "label": "cbBTC Stablecoins",
    "category": "10",
    "collaterals": [
      {
        "marketUid": "AAVE_V3:8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "depositRate": 0.02182578,
        "utilization": 0.055977995665030346,
        "borrowFactor": 1,
        "totalDebtUsd": 9416482.65343047,
        "intrinsicYield": null,
        "totalLiquidity": 1962.37121361,
        "underlyingInfo": {
          "asset": {
            "name": "Coinbase Wrapped BTC",
            "props": null,
            "symbol": "cbBTC",
            "address": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/40143/standard/cbbtc.webp",
            "decimals": 8,
            "assetGroup": "CBBTC",
            "currencyId": "Coinbase Wrapped BTC::cbBTC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 79067.82373177,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 81459.94149972
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 79067.82373177,
            "oraclePriceUsd": 79067.82373177
          }
        },
        "borrowLiquidity": 263.63712674,
        "collateralFactor": 0.83,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 168217574.45154434,
        "totalLiquidityUsd": 158801806.58019152,
        "borrowLiquidityUsd": 21334420.17369673,
        "variableBorrowRate": 0.77686361,
        "borrowCollateralFactor": 0.8
      }
    ],
    "borrowables": [
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "depositRate": 3.08230254,
        "utilization": 0.8340421828067578,
        "borrowFactor": 1,
        "totalDebtUsd": 152830814.8920707,
        "intrinsicYield": null,
        "totalLiquidity": 30418122.225042,
        "underlyingInfo": {
          "asset": {
            "name": "USD Coin",
            "props": {
              "permit": {
                "type": 1,
                "version": "2"
              }
            },
            "symbol": "USDC",
            "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
            "decimals": 6,
            "assetGroup": "USDC",
            "currencyId": "USD Coin::USDC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 0.99977056,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 0.99996012
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 1
          },
          "oraclePrice": {
            "oraclePrice": 0.99977056,
            "oraclePriceUsd": 0.99977056
          }
        },
        "borrowLiquidity": 30418122.225042,
        "collateralFactor": 0.83,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 183241109.43376663,
        "totalLiquidityUsd": 30411127.882017575,
        "borrowLiquidityUsd": 30411127.882017575,
        "variableBorrowRate": 4.08558871,
        "borrowCollateralFactor": 0.8
      },
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "depositRate": 7.60956194,
        "utilization": 0.910308431683843,
        "borrowFactor": 1,
        "totalDebtUsd": 1936171.1105309497,
        "intrinsicYield": null,
        "totalLiquidity": 190784.47512063294,
        "underlyingInfo": {
          "asset": {
            "name": "GHO Token",
            "props": null,
            "symbol": "GHO",
            "address": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/30663/thumb/gho-token-logo.png?1720517092",
            "decimals": 18,
            "assetGroup": "GHO",
            "currencyId": "GHO Token::GHO",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 1,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 1
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 1,
            "oraclePriceUsd": 1
          }
        },
        "borrowLiquidity": 190784.47512063294,
        "collateralFactor": 0.83,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 2126939.6647788016,
        "totalLiquidityUsd": 190784.4751206329,
        "borrowLiquidityUsd": 190784.4751206329,
        "variableBorrowRate": 9.2130055,
        "borrowCollateralFactor": 0.8
      }
    ],
    "chainRiskScore": 2,
    "lenderRiskScore": 1,
    "maxTokenRiskScore": 2,
    "configRiskScore": 2,
    "configRiskLabel": "low",
    "tokenRisks": [
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 5,
        "tokenRiskScores": {
          "label": "GHO",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 2,
          "assetGroup": "GHO",
          "isDepegged": false,
          "qualityScore": 0.85
        },
        "underlyingAddress": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee"
      },
      {
        "marketUid": "AAVE_V3:8453:0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "Coinbase Wrapped BTC",
          "source": "whitelist",
          "symbol": null,
          "category": null,
          "riskScore": 2,
          "assetGroup": "CBBTC"
        },
        "underlyingAddress": "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"
      },
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 1,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "USD Coin",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 1,
          "assetGroup": "USDC",
          "isDepegged": false,
          "qualityScore": 1
        },
        "underlyingAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
      }
    ]
  },
  {
    "lenderKey": "AAVE_V3",
    "chainId": "8453",
    "configId": "11",
    "label": "SyrupUSDC__USDC_GHO",
    "category": "11",
    "collaterals": [
      {
        "marketUid": "AAVE_V3:8453:0x660975730059246a68521a3e2fbd4740173100f5",
        "depositRate": 0,
        "utilization": 0,
        "borrowFactor": 1,
        "totalDebtUsd": 0,
        "intrinsicYield": 4.85690993,
        "totalLiquidity": 16211292.18121,
        "underlyingInfo": {
          "asset": {
            "name": "Syrup USDC",
            "props": null,
            "symbol": "syrupUSDC",
            "address": "0x660975730059246a68521a3e2fbd4740173100f5",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/54658/thumb/syrupUSDC.png?1761824955",
            "decimals": 6,
            "assetGroup": "SYRUPUSDC",
            "currencyId": "Syrup USDC::syrupUSDC",
            "intrinsicYield": 4.85690993
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 1.16408717,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 1.16415872
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 1
          },
          "oraclePrice": {
            "oraclePrice": 1.16408717,
            "oraclePriceUsd": 1.16408717
          }
        },
        "borrowLiquidity": 1,
        "collateralFactor": 0.92,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 18868930.082602505,
        "totalLiquidityUsd": 18868930.082602505,
        "borrowLiquidityUsd": 1.16393745,
        "variableBorrowRate": 0,
        "borrowCollateralFactor": 0.9
      }
    ],
    "borrowables": [
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "depositRate": 3.08230254,
        "utilization": 0.8340421828067578,
        "borrowFactor": 1,
        "totalDebtUsd": 152830814.8920707,
        "intrinsicYield": null,
        "totalLiquidity": 30418122.225042,
        "underlyingInfo": {
          "asset": {
            "name": "USD Coin",
            "props": {
              "permit": {
                "type": 1,
                "version": "2"
              }
            },
            "symbol": "USDC",
            "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            "chainId": "8453",
            "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
            "decimals": 6,
            "assetGroup": "USDC",
            "currencyId": "USD Coin::USDC",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 0.99977056,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 0.99996012
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 1
          },
          "oraclePrice": {
            "oraclePrice": 0.99977056,
            "oraclePriceUsd": 0.99977056
          }
        },
        "borrowLiquidity": 30418122.225042,
        "collateralFactor": 0.92,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 183241109.43376663,
        "totalLiquidityUsd": 30411127.882017575,
        "borrowLiquidityUsd": 30411127.882017575,
        "variableBorrowRate": 4.08558871,
        "borrowCollateralFactor": 0.9
      },
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "depositRate": 7.60956194,
        "utilization": 0.910308431683843,
        "borrowFactor": 1,
        "totalDebtUsd": 1936171.1105309497,
        "intrinsicYield": null,
        "totalLiquidity": 190784.47512063294,
        "underlyingInfo": {
          "asset": {
            "name": "GHO Token",
            "props": null,
            "symbol": "GHO",
            "address": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
            "chainId": "8453",
            "logoURI": "https://assets.coingecko.com/coins/images/30663/thumb/gho-token-logo.png?1720517092",
            "decimals": 18,
            "assetGroup": "GHO",
            "currencyId": "GHO Token::GHO",
            "intrinsicYield": null
          },
          "prices": {
            "priceTs": "2026-05-15T20:18:00+00:00",
            "priceUsd": 1,
            "priceTs24h": "2026-05-14T20:00:00+00:00",
            "priceUsd24h": 1
          },
          "tokenRisk": {
            "riskLabel": "low",
            "riskScore": 2
          },
          "oraclePrice": {
            "oraclePrice": 1,
            "oraclePriceUsd": 1
          }
        },
        "borrowLiquidity": 190784.47512063294,
        "collateralFactor": 0.92,
        "stableBorrowRate": 0,
        "totalDepositsUsd": 2126939.6647788016,
        "totalLiquidityUsd": 190784.4751206329,
        "borrowLiquidityUsd": 190784.4751206329,
        "variableBorrowRate": 9.2130055,
        "borrowCollateralFactor": 0.9
      }
    ],
    "chainRiskScore": 2,
    "lenderRiskScore": 1,
    "maxTokenRiskScore": 2,
    "configRiskScore": 2,
    "configRiskLabel": "low",
    "tokenRisks": [
      {
        "marketUid": "AAVE_V3:8453:0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 2,
        "oracleRiskScore": 5,
        "tokenRiskScores": {
          "label": "GHO",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 2,
          "assetGroup": "GHO",
          "isDepegged": false,
          "qualityScore": 0.85
        },
        "underlyingAddress": "0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee"
      },
      {
        "marketUid": "AAVE_V3:8453:0x660975730059246a68521a3e2fbd4740173100f5",
        "isCollateral": true,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 1,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "syrupUSDC",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 1,
          "assetGroup": "SYRUPUSDC",
          "isDepegged": false,
          "qualityScore": 0.96
        },
        "underlyingAddress": "0x660975730059246a68521a3e2fbd4740173100f5"
      },
      {
        "marketUid": "AAVE_V3:8453:0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "isCollateral": false,
        "tokenRiskLabel": "low",
        "tokenRiskScore": 1,
        "oracleRiskScore": 1,
        "tokenRiskScores": {
          "label": "USD Coin",
          "source": "stablecoin",
          "symbol": null,
          "category": "STABLECOIN",
          "isExotic": false,
          "riskScore": 1,
          "assetGroup": "USDC",
          "isDepegged": false,
          "qualityScore": 1
        },
        "underlyingAddress": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
      }
    ]
  },
];

const CHAIN_LABELS: Record<string, string> = {
  '1': 'Ethereum',
  '10': 'Optimism',
  '137': 'Polygon',
  '8453': 'Base',
  '42161': 'Arbitrum',
  '84532': 'Base Sepolia',
  '11155111': 'Sepolia',
};

export function chainLabelFor(chainId: string): string {
  return CHAIN_LABELS[chainId] ?? `Chain ${chainId}`;
}
