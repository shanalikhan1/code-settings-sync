npm install node-pre-gyp
npm i --no-optional
npm dedupe
npm up
npm install -g vsce
printf "Applying Token"
echo "[{\"name\":\"Shan\",\"pat\":\"$VSCE_TOKEN\"}]" > ~/.vsce
vsce publish
