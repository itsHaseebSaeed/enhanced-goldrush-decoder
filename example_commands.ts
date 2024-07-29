
curl --location 'http://localhost:8080/api/v1/tx/decode' \
--header 'x-covalent-api-key: cqt_rQfCJ87bB4DMCcHxGwQDHMdpPfHT' \
--header 'Content-Type: application/json' \
--data '{
"chain_name": "eth-mainnet",
"tx_hash": "0x7f3e1ebb995c6ddf3f2021f0530eca41e521c319e4e6f0302511258b362c8d36"
}'


curl --location 'http://localhost:8080/api/v1/wallet/decode' \
--header 'x-covalent-api-key: cqt_rQfCJ87bB4DMCcHxGwQDHMdpPfHT' \
--header 'Content-Type: application/json' \
--data '{
"chain_name": "eth-mainnet",
"wallet_address": "0x4a6b6964856fba43e4c09f645584e5fee8faf659"
}'



