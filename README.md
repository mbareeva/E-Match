# E-Match

This project is aimed at the finding out whether Elasticsearch alone can create recommendations for the target user. The problem of recommendations is researched through a search lense to find out whether users with relevant content can be found using only Elasticsearch functions and techniques.
The dataset is based on the public user profile data from the social network Instagram. The research also gives an overview on how to work with Instagram Graph API for requesting profile and media data (only public available data).

## To create indeces in ES

```
PUT /users 
PUT /medias
```
## To update index with vector type field in ES for cosine similarity calculation.

```
PUT users/_mapping
{
      "properties" : {
        "biography" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "followers_count" : {
          "type" : "long"
        },
        "fullname" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "interest" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "latestMedia" : {
          "properties" : {
            "_id" : {
              "type" : "text",
              "fields" : {
                "keyword" : {
                  "type" : "keyword",
                  "ignore_above" : 256
                }
              }
            },
            "caption" : {
              "type" : "text",
              "fields" : {
                "keyword" : {
                  "type" : "keyword",
                  "ignore_above" : 256
                }
              }
            },
            "commentCount" : {
              "type" : "long"
            },
            "likes" : {
              "type" : "long"
            }
          }
        },
        "location" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "role" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "specialisation" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "unit_vector" : {
          "type" : "dense_vector",
          "dims" : 512
        },
        "username" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "website" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        }
  }
}

```

## To update the settings in ES - close the indey, update it, reopen it.

```
POST /users/_close?wait_for_active_shards=0
PUT /users/_settings
{
  "analysis": {
    "analyzer": {
      "my_analyzer": {
        "tokenizer": "standard",
        "filter": [
          "lowercase",
          "my_stemmer",
          "my_stopwords",
          "synonym"
        ]
      }
    },
    "filter": {
      "my_stemmer": {
        "type": "stemmer",
        "language": "light_english"
      },
      "my_stopwords": {
        "type": "stop",
        "stopwords": "_english_"
      },
      "synonym": {
        "type": "synonym",
        "synonyms": [
          "gym, training, sport, workout",
          "jumped, jump",
          "priveleged, privelege, honor"
        ]
      }
    }
  }
}
POST /users/_open
```