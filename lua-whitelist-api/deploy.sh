echo "Switching to branch master"
git checkout master

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r ./* admin@138.201.137.59:/home/admin/LuaLock/lua-whitelist-api/

echo "Done!"