/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/hegemony.json`.
 */
export type Hegemony = {
  "address": "79yvXQvVyqMYy4ofqKQD1CZXQSyH5eJ7dHT6ZZuXg7ND",
  "metadata": {
    "name": "hegemony",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "advanceTurn",
      "discriminator": [
        20,
        108,
        166,
        78,
        43,
        211,
        57,
        29
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimEpochYield",
      "discriminator": [
        162,
        87,
        159,
        165,
        6,
        85,
        63,
        39
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "delegationRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "winningEscrow"
              }
            ]
          }
        },
        {
          "name": "winningEscrow"
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userCapitalAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "claimPayout",
      "discriminator": [
        127,
        240,
        132,
        62,
        227,
        198,
        146,
        133
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "userCapitalAccount",
          "writable": true
        },
        {
          "name": "userWinningShares",
          "writable": true
        },
        {
          "name": "winningMint",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "delegateToBidder",
      "discriminator": [
        97,
        139,
        86,
        24,
        104,
        246,
        147,
        125
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "leaderboard",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true
        },
        {
          "name": "delegationRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "delegate"
              },
              {
                "kind": "account",
                "path": "escrow"
              }
            ]
          }
        },
        {
          "name": "delegate",
          "writable": true,
          "signer": true
        },
        {
          "name": "delegateTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "endEpoch",
      "discriminator": [
        195,
        166,
        17,
        226,
        105,
        210,
        96,
        216
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "winningRegion"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeDiplomacy",
      "discriminator": [
        6,
        244,
        11,
        158,
        79,
        195,
        232,
        65
      ],
      "accounts": [
        {
          "name": "diplomacy",
          "writable": true
        },
        {
          "name": "region"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeGlobalState",
      "discriminator": [
        232,
        254,
        209,
        244,
        123,
        89,
        154,
        207
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury"
        },
        {
          "name": "capitalMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "auctionDuration",
          "type": "i64"
        },
        {
          "name": "epochDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initializeLeaderboard",
      "discriminator": [
        47,
        23,
        34,
        39,
        46,
        108,
        91,
        176
      ],
      "accounts": [
        {
          "name": "leaderboard",
          "writable": true
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "regionId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "yesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "capitalVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorCapitalAccount",
          "writable": true
        },
        {
          "name": "capitalMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "regionId",
          "type": "u8"
        },
        {
          "name": "thesisType",
          "type": {
            "defined": {
              "name": "thesisType"
            }
          }
        },
        {
          "name": "liquidity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeRegion",
      "discriminator": [
        123,
        37,
        67,
        141,
        239,
        179,
        231,
        113
      ],
      "accounts": [
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "bondMint",
          "writable": true
        },
        {
          "name": "bondVault",
          "writable": true
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "capitalMint"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "regionId",
          "type": "u8"
        },
        {
          "name": "resourceYield",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initiateCovertOp",
      "discriminator": [
        97,
        49,
        21,
        238,
        28,
        54,
        12,
        233
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "targetRegion",
          "writable": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "initiatorDiplomacy",
          "writable": true
        },
        {
          "name": "initiator",
          "writable": true,
          "signer": true
        },
        {
          "name": "initiatorCapitalAccount",
          "writable": true
        },
        {
          "name": "marketVault",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "initiatorRegionId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processRegionIncome",
      "discriminator": [
        138,
        117,
        91,
        73,
        171,
        146,
        17,
        67
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "capitalMint",
          "writable": true
        },
        {
          "name": "bondVault",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "resolveAuction",
      "discriminator": [
        191,
        112,
        64,
        241,
        38,
        232,
        227,
        26
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "leaderboard"
        },
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "resolveKineticMarket",
      "discriminator": [
        115,
        167,
        172,
        219,
        19,
        136,
        143,
        210
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "targetRegion",
          "writable": true
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "discriminator": [
        155,
        23,
        80,
        173,
        46,
        74,
        23,
        239
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setRegionOwner",
      "discriminator": [
        232,
        230,
        180,
        133,
        68,
        181,
        108,
        230
      ],
      "accounts": [
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "stakeCapital",
      "discriminator": [
        219,
        148,
        252,
        37,
        16,
        97,
        192,
        160
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "bondMint",
          "writable": true
        },
        {
          "name": "bondVault",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userCapitalAccount",
          "writable": true
        },
        {
          "name": "userBondAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "bondMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitManifestoBid",
      "discriminator": [
        178,
        254,
        73,
        177,
        243,
        184,
        195,
        40
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "leaderboard",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true
        },
        {
          "name": "bidder",
          "writable": true,
          "signer": true
        },
        {
          "name": "bidderTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "regionId",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "manifestoUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "tradeShares",
      "discriminator": [
        209,
        118,
        123,
        142,
        138,
        150,
        241,
        13
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "trader",
          "writable": true,
          "signer": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "traderCapitalAccount",
          "writable": true
        },
        {
          "name": "yesMint",
          "writable": true
        },
        {
          "name": "noMint",
          "writable": true
        },
        {
          "name": "traderYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "traderNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "isBuyingYes",
          "type": "bool"
        },
        {
          "name": "amountCapital",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unstakeCapital",
      "discriminator": [
        38,
        232,
        234,
        114,
        253,
        89,
        90,
        12
      ],
      "accounts": [
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "bondMint",
          "writable": true
        },
        {
          "name": "bondVault",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userCapitalAccount",
          "writable": true
        },
        {
          "name": "userBondAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "bondAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateRegionDominance",
      "discriminator": [
        173,
        95,
        13,
        10,
        238,
        215,
        189,
        214
      ],
      "accounts": [
        {
          "name": "region",
          "writable": true
        },
        {
          "name": "market",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "bidderEscrow",
      "discriminator": [
        207,
        174,
        201,
        72,
        196,
        64,
        123,
        15
      ]
    },
    {
      "name": "delegationRecord",
      "discriminator": [
        203,
        185,
        161,
        226,
        129,
        251,
        132,
        155
      ]
    },
    {
      "name": "diplomaticInfluenceAccount",
      "discriminator": [
        201,
        76,
        219,
        203,
        143,
        85,
        135,
        44
      ]
    },
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "marketAccount",
      "discriminator": [
        201,
        78,
        187,
        225,
        240,
        198,
        201,
        251
      ]
    },
    {
      "name": "regionAccount",
      "discriminator": [
        212,
        36,
        165,
        65,
        54,
        204,
        128,
        178
      ]
    },
    {
      "name": "regionLeaderboard",
      "discriminator": [
        191,
        72,
        123,
        97,
        203,
        241,
        38,
        77
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "turnNotReady",
      "msg": "Turn duration has not yet elapsed"
    },
    {
      "code": 6001,
      "name": "incomeAlreadyProcessed",
      "msg": "Income for this region has already been processed for the current turn"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Numerical overflow"
    },
    {
      "code": 6003,
      "name": "invalidOwner",
      "msg": "Invalid region owner"
    },
    {
      "code": 6004,
      "name": "auctionEnded",
      "msg": "Auction has already ended"
    },
    {
      "code": 6005,
      "name": "auctionOngoing",
      "msg": "Auction is still ongoing"
    },
    {
      "code": 6006,
      "name": "invalidStatus",
      "msg": "Invalid Game Status"
    },
    {
      "code": 6007,
      "name": "marketResolved",
      "msg": "Market already resolved"
    },
    {
      "code": 6008,
      "name": "marketUnresolved",
      "msg": "Market is still unresolved"
    },
    {
      "code": 6009,
      "name": "invalidAmmCalculation",
      "msg": "Invalid AMM Calculation"
    },
    {
      "code": 6010,
      "name": "insufficientInfluence",
      "msg": "Insufficient Diplomatic Influence"
    }
  ],
  "types": [
    {
      "name": "bidderEscrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "regionId",
            "type": "u8"
          },
          {
            "name": "manifestoUri",
            "type": "string"
          },
          {
            "name": "principalCapital",
            "type": "u64"
          },
          {
            "name": "delegatedCapital",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "delegationRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegator",
            "type": "pubkey"
          },
          {
            "name": "leader",
            "type": "pubkey"
          },
          {
            "name": "regionId",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "diplomaticInfluenceAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "regionId",
            "type": "u8"
          },
          {
            "name": "influence",
            "type": "u64"
          },
          {
            "name": "lastActionTurn",
            "type": "u32"
          },
          {
            "name": "turnActionCount",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "preEpoch"
          },
          {
            "name": "active"
          },
          {
            "name": "ended"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "epoch",
            "type": "u64"
          },
          {
            "name": "turn",
            "type": "u32"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "auctionEndTime",
            "type": "i64"
          },
          {
            "name": "lastTurnTimestamp",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "gameStatus"
              }
            }
          },
          {
            "name": "hegemon",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "totalPrizePool",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "capitalMint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "regionId",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "thesisType",
            "type": {
              "defined": {
                "name": "thesisType"
              }
            }
          },
          {
            "name": "yesMint",
            "type": "pubkey"
          },
          {
            "name": "noMint",
            "type": "pubkey"
          },
          {
            "name": "capitalVault",
            "type": "pubkey"
          },
          {
            "name": "poolYes",
            "type": "u64"
          },
          {
            "name": "poolNo",
            "type": "u64"
          },
          {
            "name": "resolutionState",
            "type": {
              "defined": {
                "name": "resolutionState"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "regionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u8"
          },
          {
            "name": "dominance",
            "type": "u8"
          },
          {
            "name": "energyLevel",
            "type": "u8"
          },
          {
            "name": "techLevel",
            "type": "u8"
          },
          {
            "name": "logisticsLevel",
            "type": "u8"
          },
          {
            "name": "factionOwner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "resourceYield",
            "type": "u64"
          },
          {
            "name": "bondMint",
            "type": "pubkey"
          },
          {
            "name": "bondVault",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "regionStatus"
              }
            }
          },
          {
            "name": "volatilityPenalty",
            "type": "u16"
          },
          {
            "name": "lastIncomeTurn",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "regionLeaderboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "regionId",
            "type": "u8"
          },
          {
            "name": "currentLeader",
            "type": "pubkey"
          },
          {
            "name": "leaderManifestoUri",
            "type": "string"
          },
          {
            "name": "totalBidWeight",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "regionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "stable"
          },
          {
            "name": "contested"
          },
          {
            "name": "blockaded"
          }
        ]
      }
    },
    {
      "name": "resolutionState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "unresolved"
          },
          {
            "name": "resolvedYes"
          },
          {
            "name": "resolvedNo"
          }
        ]
      }
    },
    {
      "name": "thesisType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "macro"
          },
          {
            "name": "micro"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "bondMintSeed",
      "type": "bytes",
      "value": "[98, 111, 110, 100, 95, 109, 105, 110, 116]"
    },
    {
      "name": "covertOpCost",
      "type": "u64",
      "value": "1000"
    },
    {
      "name": "diplomacySeed",
      "type": "bytes",
      "value": "[100, 105, 112, 108, 111, 109, 97, 99, 121]"
    },
    {
      "name": "escrowSeed",
      "type": "bytes",
      "value": "[101, 115, 99, 114, 111, 119]"
    },
    {
      "name": "globalStateSeed",
      "type": "bytes",
      "value": "[103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]"
    },
    {
      "name": "leaderboardSeed",
      "type": "bytes",
      "value": "[108, 101, 97, 100, 101, 114, 98, 111, 97, 114, 100]"
    },
    {
      "name": "marketSeed",
      "type": "bytes",
      "value": "[109, 97, 114, 107, 101, 116]"
    },
    {
      "name": "noMintSeed",
      "type": "bytes",
      "value": "[110, 111, 95, 109, 105, 110, 116]"
    },
    {
      "name": "regionSeed",
      "type": "bytes",
      "value": "[114, 101, 103, 105, 111, 110]"
    },
    {
      "name": "turnDuration",
      "type": "i64",
      "value": "5"
    },
    {
      "name": "vaultSeed",
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    },
    {
      "name": "yesMintSeed",
      "type": "bytes",
      "value": "[121, 101, 115, 95, 109, 105, 110, 116]"
    }
  ]
};
