# E-Match

This project is aimed at the finding out whether Elasticsearch (ES) alone can create recommendations for the target user. The problem of recommendations is researched through a search lense to find out whether users with relevant content can be found using only Elasticsearch functions and techniques. The search results of ES search are compare to the text similarity search based on sematics with help of pre-trained model of TensorFlow and Universal Sentence Encoder.
The dataset is based on the public user profile data from the social network Instagram. The research also gives an overview on how to work with Instagram Graph API for requesting profile and media data (only public available data).

## To create indeces in ES

```
PUT /users 
PUT /medias
```
## To update index with vector type field in ES for cosine similarity calculation (This functionality is available only locally!)
On production the mapping does not contain the dense_vector type as it is not supported by Bonsai addon.

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

## On production the search without Vectors and Embeddings is presented. Only Elasticsearch search - setQuery() function in matchesController.js.
 The search with cosine similarity is available *locally* after downloading the zip folder of the project. The ```dense_vector``` type is not supported by Bonsai Elasticsearch add-on on Production. For that Elasticsearch and Kibana should be installed and run e.g. on Windows OS
```
kibana.bat
elasticsearch.bat
```

## Screenshots of the application:
* Login

![image](https://user-images.githubusercontent.com/38938392/134825902-ef91fc5e-a263-48f8-8699-dd24f90a7505.png)

* Signup

![image](https://user-images.githubusercontent.com/38938392/134826083-458c9bf0-5ea4-438f-b6b4-a59603b5d1f3.png)


* Authorization via Facebook for Instagram business users

![image](https://user-images.githubusercontent.com/38938392/134825989-f67ed7a3-4dc8-4833-b5ad-394326af659c.png)


* Profile page


![image](https://user-images.githubusercontent.com/38938392/134825887-418d2c21-d4ef-49fe-b727-622f18fe0266.png)

* Matches page

![image](https://user-images.githubusercontent.com/38938392/134825935-9465a6d4-27fa-443d-87e7-378804fd992c.png)

