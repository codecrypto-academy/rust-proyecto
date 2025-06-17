import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CommunityManagement } from "../target/types/community_management";
import { expect } from "chai";

describe("community-management", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.CommunityManagement as Program<CommunityManagement>;

    let admin = anchor.web3.Keypair.generate();
    let member1 = anchor.web3.Keypair.generate();
    let member2 = anchor.web3.Keypair.generate();

    let communityPda: anchor.web3.PublicKey;
    let communityBump: number;

    before(async () => {
        await provider.connection.requestAirdrop(admin.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.requestAirdrop(member1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.requestAirdrop(member2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it("Debe inicializar una nueva comunidad", async () => {
        const communityName = "Test Community";
        const communityDescription = "Una comunidad de prueba para testing";

        [communityPda, communityBump] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("community"), Buffer.from(communityName)],
            program.programId
        );

        await program.methods
        .initializeCommunity(communityName, communityDescription)
        .accounts({
            // community: communityPda,
            admin: admin.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

        const communityAccount = await program.account.community.fetch(communityPda);
        expect(communityAccount.name).to.equal(communityName);
        expect(communityAccount.description).to.equal(communityDescription);
        expect(communityAccount.admin.toString()).to.equal(admin.publicKey.toString());
        expect(communityAccount.memberCount.toNumber()).to.equal(0);
    });

    it("Debe permitir que un usuario solicite unirse a la comunidad", async () => {
        const [membershipPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), communityPda.toBuffer(), member1.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
        .joinCommunity()
        .accounts({
            // membership: membershipPda,
            community: communityPda,
            member: member1.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

        const membershipAccount = await program.account.membership.fetch(membershipPda);
        expect(membershipAccount.member.toString()).to.equal(member1.publicKey.toString());
        expect(membershipAccount.isApproved).to.be.false;
    });

    it("Debe permitir al admin aprobar membresías", async () => {
        const [membershipPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), communityPda.toBuffer(), member1.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
        .approveMembership()
        .accounts({
            community: communityPda,
            membership: membershipPda,
            admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

        const membershipAccount = await program.account.membership.fetch(membershipPda);
        expect(membershipAccount.isApproved).to.be.true;

        const communityAccount = await program.account.community.fetch(communityPda);
        expect(communityAccount.memberCount.toNumber()).to.equal(1);
    });

    it("Debe permitir a miembros aprobados crear votaciones", async () => {
        const question = "¿Cuál es tu color favorito?";
        const options = ["Rojo", "Azul", "Verde"];
        const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hora desde ahora

        const [membershipPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), communityPda.toBuffer(), member1.publicKey.toBuffer()],
            program.programId
        );

        const communityAccount = await program.account.community.fetch(communityPda);
        const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("poll"), communityPda.toBuffer(), communityAccount.totalPolls.toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        await program.methods
        .createPoll(question, options, new anchor.BN(endTime))
        .accounts({
            // poll: pollPda,
            community: communityPda,
            membership: membershipPda,
            creator: member1.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

        const pollAccount = await program.account.poll.fetch(pollPda);
        expect(pollAccount.question).to.equal(question);
        expect(pollAccount.options).to.deep.equal(options);
        expect(pollAccount.isActive).to.be.true;
        expect(pollAccount.totalVotes.toNumber()).to.equal(0);
    });

    it("Debe permitir a miembros aprobados votar", async () => {
        // Primero, hacer que member2 se una y sea aprobado
        const [membershipPda2] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), communityPda.toBuffer(), member2.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
        .joinCommunity()
        .accounts({
            // membership: membershipPda2,
            community: communityPda,
            member: member2.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([member2])
        .rpc();

        await program.methods
        .approveMembership()
        .accounts({
            community: communityPda,
            membership: membershipPda2,
            admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();

        // Ahora votar
        // const communityAccount = await program.account.community.fetch(communityPda);
        const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("poll"), communityPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("vote"), pollPda.toBuffer(), member2.publicKey.toBuffer()],
            program.programId
        );

        await program.methods
        .castVote(1) // Votar por "Azul" (índice 1)
        .accounts({
            // vote: votePda,
            poll: pollPda,
            membership: membershipPda2,
            voter: member2.publicKey,
            // systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([member2])
        .rpc();

        const pollAccount = await program.account.poll.fetch(pollPda);
        expect(pollAccount.totalVotes.toNumber()).to.equal(1);
        expect(pollAccount.voteCounts[1].toNumber()).to.equal(1);

        const voteAccount = await program.account.vote.fetch(votePda);
        expect(voteAccount.optionIndex).to.equal(1);
        expect(voteAccount.voter.toString()).to.equal(member2.publicKey.toString());
    });

    it("Debe prevenir votos duplicados", async () => {
        const [membershipPda2] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("membership"), communityPda.toBuffer(), member2.publicKey.toBuffer()],
            program.programId
        );

        const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("poll"), communityPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        // const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
        //     [Buffer.from("vote"), pollPda.toBuffer(), member2.publicKey.toBuffer()],
        //     program.programId
        // );

        try {
            await program.methods
            .castVote(0) // Intentar votar de nuevo
            .accounts({
                // vote: votePda,
                poll: pollPda,
                membership: membershipPda2,
                voter: member2.publicKey,
                // systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([member2])
            .rpc();

            expect.fail("Debería haber fallado por voto duplicado");
        } catch (error) {
            // Esperamos que falle porque la cuenta ya existe
            expect(error.toString()).to.include("already in use");
        }
    });

    it("Debe permitir cerrar votaciones", async () => {
        const [pollPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("poll"), communityPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
            program.programId
        );

        await program.methods
        .closePoll()
        .accounts({
            poll: pollPda,
            community: communityPda,
            authority: admin.publicKey, // Admin puede cerrar cualquier votación
        })
        .signers([admin])
        .rpc();

        const pollAccount = await program.account.poll.fetch(pollPda);
        expect(pollAccount.isActive).to.be.false;
    });
});
