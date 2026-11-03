export class MesaInexistenteError extends Error {
    constructor(readonly mesaId: number) {
        super(`No existe la mesa con id ${mesaId}`);
        this.name = 'MesaInexistenteError';
    }
}
