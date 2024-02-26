import request from "supertest";
import app from "../../../../api";
import { type EventType } from "../../decoder.types";

describe("compound-v2", () => {
    test("eth-mainnet:Mint", async () => {
        const res = await request(app)
            .post("/api/v1/tx/decode")
            .set({ "x-covalent-api-key": process.env.TEST_COVALENT_API_KEY })
            .send({
                chain_name: "eth-mainnet",
                tx_hash:
                    "0xf49858398e325a1b2c71795c3615f42242d5a6fe6ccc5f23ea128854b23632a1",
            });
        const { events } = res.body as { events: EventType[] };
        const event = events.find(({ name }) => name === "Mint");
        if (!event) {
            throw Error("Event not found");
        }
        expect(event?.details?.length).toEqual(3);
    });
});
