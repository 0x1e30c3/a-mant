import { expect } from "chai";
import { ethers } from "hardhat";

// The first deposit must write a "genesis" Chronicle chapter, so the Chronicle
// page is populated immediately after a user deposits.
describe("Chronicle genesis chapter on first deposit", () => {
  async function deploy() {
    const [deployer, user] = await ethers.getSigners();

    const Mock = await ethers.getContractFactory("MockERC20");
    const usdy = await Mock.deploy("Mock USDY", "mUSDY", 18, ethers.parseEther("1000000"));
    const meth = await Mock.deploy("Mock mETH", "mmETH", 18, ethers.parseEther("1000000"));
    await usdy.waitForDeployment();
    await meth.waitForDeployment();

    const Vault = await ethers.getContractFactory("AMANTVaultTestnet");
    const vault = await Vault.deploy(deployer.address, await usdy.getAddress(), await meth.getAddress());
    await vault.waitForDeployment();

    const Chronicle = await ethers.getContractFactory("AMANTChronicle");
    const chronicle = await Chronicle.deploy();
    await chronicle.waitForDeployment();

    // Wire: vault knows the chronicle, chronicle authorizes the vault as a writer.
    await vault.setChronicle(await chronicle.getAddress());
    await chronicle.setWriter(await vault.getAddress(), true);

    // Fund the user and approve the vault.
    await usdy.mint(user.address, ethers.parseEther("1000"));
    await usdy.connect(user).approve(await vault.getAddress(), ethers.parseEther("1000"));

    return { vault, chronicle, usdy, deployer, user };
  }

  it("creates exactly one DEPOSIT chapter on the first deposit", async () => {
    const { vault, chronicle, usdy, user } = await deploy();

    expect(await chronicle.getChapterCount(user.address)).to.equal(0n);

    await vault.connect(user).deposit(await usdy.getAddress(), ethers.parseEther("100"));

    expect(await chronicle.getChapterCount(user.address)).to.equal(1n);
    const chapter = await chronicle.getLatestChapter(user.address);
    expect(chapter.title).to.equal("The first chapter");
    expect(chapter.chapterType).to.equal(4); // ChapterType.DEPOSIT
  });

  it("does not write another genesis chapter on subsequent deposits", async () => {
    const { vault, chronicle, usdy, user } = await deploy();

    await vault.connect(user).deposit(await usdy.getAddress(), ethers.parseEther("100"));
    await vault.connect(user).deposit(await usdy.getAddress(), ethers.parseEther("50"));

    expect(await chronicle.getChapterCount(user.address)).to.equal(1n);
  });

  it("still lets a deposit succeed if the Chronicle is not configured", async () => {
    const [deployer, user] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockERC20");
    const usdy = await Mock.deploy("Mock USDY", "mUSDY", 18, ethers.parseEther("1000000"));
    await usdy.waitForDeployment();
    const Vault = await ethers.getContractFactory("AMANTVaultTestnet");
    const vault = await Vault.deploy(deployer.address, await usdy.getAddress(), await usdy.getAddress());
    await vault.waitForDeployment();

    await usdy.mint(user.address, ethers.parseEther("100"));
    await usdy.connect(user).approve(await vault.getAddress(), ethers.parseEther("100"));

    // chronicleContract is address(0) — deposit must not revert.
    await expect(
      vault.connect(user).deposit(await usdy.getAddress(), ethers.parseEther("100"))
    ).to.not.be.reverted;
  });
});
