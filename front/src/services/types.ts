import * as anchor from "@coral-xyz/anchor";

export interface Community {
    admin: anchor.web3.PublicKey;
    name: string;
    description: string;
    memberCount: anchor.BN;
    totalPolls: anchor.BN;
    bump?: number;
}

export interface Member {
    community?: anchor.web3.PublicKey;
    address: anchor.web3.PublicKey;
    isApproved: boolean;
    joinedAt: anchor.BN;
    bump?: number;
}

export interface MembershipStatus {
    isMember: boolean;
    isApproved: boolean;
}

export interface Poll {
    id?: anchor.web3.PublicKey,
    community: anchor.web3.PublicKey;
    creator: anchor.web3.PublicKey;
    question: string;
    options: string[];
    voteCounts: number[];
    endTime: Date;
    totalVotes: number;
    isActive: boolean;
    bump?: number;
}

export interface Vote {
    poll: anchor.web3.PublicKey;
    voter: anchor.web3.PublicKey;
    optionIndex: number;
    votedAt: anchor.BN;
    bump?: number;
}

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/community_management.json`.
 */
export type CommunityManagement = {
  "address": "CgEPCH2sZKj5Zi7Ms2pJsvi4KKVde76GYbSRnfePGHtn",
  "metadata": {
    "name": "communityManagement",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveMembership",
      "discriminator": [
        134,
        27,
        129,
        176,
        71,
        244,
        61,
        255
      ],
      "accounts": [
        {
          "name": "community",
          "writable": true
        },
        {
          "name": "membership",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "castVote",
      "discriminator": [
        20,
        212,
        15,
        189,
        69,
        180,
        69,
        151
      ],
      "accounts": [
        {
          "name": "vote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "poll"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "membership"
        },
        {
          "name": "voter",
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
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closePoll",
      "discriminator": [
        139,
        213,
        162,
        65,
        172,
        150,
        123,
        67
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true
        },
        {
          "name": "community"
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createPoll",
      "discriminator": [
        182,
        171,
        112,
        238,
        6,
        219,
        14,
        110
      ],
      "accounts": [
        {
          "name": "poll",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "community"
              },
              {
                "kind": "account",
                "path": "community.total_polls",
                "account": "community"
              }
            ]
          }
        },
        {
          "name": "community",
          "writable": true
        },
        {
          "name": "membership"
        },
        {
          "name": "creator",
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
          "name": "question",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initializeCommunity",
      "discriminator": [
        200,
        51,
        132,
        44,
        192,
        86,
        125,
        41
      ],
      "accounts": [
        {
          "name": "community",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  109,
                  117,
                  110,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "admin",
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
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "joinCommunity",
      "discriminator": [
        252,
        106,
        147,
        30,
        134,
        74,
        28,
        232
      ],
      "accounts": [
        {
          "name": "membership",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114,
                  115,
                  104,
                  105,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "community"
              },
              {
                "kind": "account",
                "path": "member"
              }
            ]
          }
        },
        {
          "name": "community"
        },
        {
          "name": "member",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "community",
      "discriminator": [
        192,
        73,
        211,
        158,
        178,
        81,
        19,
        112
      ]
    },
    {
      "name": "membership",
      "discriminator": [
        231,
        141,
        180,
        98,
        109,
        168,
        175,
        166
      ]
    },
    {
      "name": "poll",
      "discriminator": [
        110,
        234,
        167,
        188,
        231,
        136,
        153,
        111
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        96,
        91,
        104,
        57,
        145,
        35,
        172,
        155
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized for this action"
    },
    {
      "code": 6001,
      "name": "invalidOptionCount",
      "msg": "Invalid number of options (must be between 2 and 4)"
    },
    {
      "code": 6002,
      "name": "invalidEndTime",
      "msg": "Invalid end date"
    },
    {
      "code": 6003,
      "name": "notApprovedMember",
      "msg": "You are not an approved member of this community"
    },
    {
      "code": 6004,
      "name": "pollNotActive",
      "msg": "The poll is not active"
    },
    {
      "code": 6005,
      "name": "pollExpired",
      "msg": "The poll has expired"
    },
    {
      "code": 6006,
      "name": "invalidOptionIndex",
      "msg": "Invalid option index"
    },
    {
      "code": 6007,
      "name": "unauthorizedToClose",
      "msg": "You are not authorized to close this poll"
    }
  ],
  "types": [
    {
      "name": "community",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "memberCount",
            "type": "u64"
          },
          {
            "name": "totalPolls",
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
      "name": "membership",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "pubkey"
          },
          {
            "name": "member",
            "type": "pubkey"
          },
          {
            "name": "isApproved",
            "type": "bool"
          },
          {
            "name": "joinedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "poll",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "community",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "voteCounts",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poll",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "optionIndex",
            "type": "u8"
          },
          {
            "name": "votedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

