import getLogger from "../src/Logger";

test("Fake test", () => {
    let logger = getLogger("test");
    logger.log("test");
    expect(1).toBe(1);
});
