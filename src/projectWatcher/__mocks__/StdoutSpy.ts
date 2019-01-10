export class StdoutSpy {
    stdoutWriteSpy = jest.spyOn(global.process.stdout, "write");
    outputCount = 0;

    expect(...message: string[]) {
        this.outputCount++;
        const ouput = message.length ? message.join("\n") : message[0];
        expect(this.stdoutWriteSpy).toHaveBeenNthCalledWith(this.outputCount, ouput);
    }

    expectNthTimes() {
        expect(this.stdoutWriteSpy).toHaveBeenCalledTimes(this.outputCount);
    }

    reset() {
        this.stdoutWriteSpy.mockReset();
        this.outputCount = 0;
    }
}
