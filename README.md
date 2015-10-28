# meteormobil
application communecter mobile native + meteor 

## Install

```
git clone https://github.com/aboire/meteormobil.git pixel
cd pixel
MONGO_URL='mongogodb=//user:pass@host:port/base' meteor run --settings settings.json
```

* serveur amazon 
* ubuntu 14.02
* nginx
* docker
* s3

## Déploiement 
### Mupx https://github.com/arunoda/meteor-up/tree/mupx
Modification du template start.sh pour intégrer graphicsmagick 
https://gist.github.com/so0k/7d4be21c5e2d9abd3743/revisions
```
mkdir deploy-pixel
cd deploy-pixel
mupx init
```

configurer mup.json et settings.json


## settings.json
```
{
"environment": "production",
"aws": {
    "access_key": "",
    "secret": "",
    "region": "",
    "bucket": ""
  },
"public":{
"bucket": ""
}
}

```
