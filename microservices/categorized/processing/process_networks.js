export default async function processNetworks(address) {
    const options = {
        method: "GET",
        headers: { Authorization: `Bearer cqt_rQfCJ87bB4DMCcHxGwQDHMdpPfHT` },
    };

    let res = await fetch(
        `https://api.covalenthq.com/v1/address/${address}/activity/`,
        options
    )
        .then((response) => response.json())
        .catch((err) => console.error(err));
    const networkNames = res?.data?.items?.map((item) => item.name);
    return networkNames;
}
