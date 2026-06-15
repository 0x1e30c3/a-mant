// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AMANTChronicle is ERC721URIStorage, Ownable {
    enum ChapterType { REBALANCE, PROTECTION, MILESTONE, YIELD, DEPOSIT }

    struct Chapter {
        string title;
        string narrative;      // human-readable story of what happened
        int256 impactAmount;   // in wei scale (positive = saved/earned)
        ChapterType chapterType;
        uint256 timestamp;
        string worldContext;   // what was happening in the world (macro signal)
    }

    uint256 private _nextTokenId;

    mapping(address => Chapter[]) public userChapters;
    mapping(address => uint256) public milestoneCount;

    address public authorizedWriter;          // primary writer (agent backend)
    mapping(address => bool) public writers;   // additional writers (e.g. the vault)

    event ChapterCreated(
        address indexed user,
        uint256 indexed chapterIndex,
        string title,
        ChapterType chapterType,
        int256 impact
    );
    event MilestoneMinted(address indexed user, uint256 indexed tokenId, string title);

    modifier onlyWriter() {
        require(
            msg.sender == authorizedWriter || writers[msg.sender] || msg.sender == owner(),
            "AMANT: only writer"
        );
        _;
    }

    constructor() ERC721("a-MANT Chronicle", "AMANT-C") Ownable(msg.sender) {}

    // ─── Chapter Creation ─────────────────────────────────────────────────────

    function createChapter(
        address user,
        string calldata title,
        string calldata narrative,
        int256 impactAmount,
        ChapterType chapterType,
        string calldata worldContext
    ) external onlyWriter returns (uint256) {
        Chapter memory chapter = Chapter({
            title: title,
            narrative: narrative,
            impactAmount: impactAmount,
            chapterType: chapterType,
            timestamp: block.timestamp,
            worldContext: worldContext
        });

        userChapters[user].push(chapter);
        uint256 chapterIndex = userChapters[user].length - 1;

        emit ChapterCreated(user, chapterIndex, title, chapterType, impactAmount);
        return chapterIndex;
    }

    // Mint a milestone NFT when user achieves a goal
    function mintMilestone(
        address user,
        string calldata title,
        string calldata tokenURI_
    ) external onlyWriter returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(user, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        milestoneCount[user]++;

        emit MilestoneMinted(user, tokenId, title);
        return tokenId;
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getChapters(address user) external view returns (Chapter[] memory) {
        return userChapters[user];
    }

    function getChapterCount(address user) external view returns (uint256) {
        return userChapters[user].length;
    }

    function getLatestChapter(address user) external view returns (Chapter memory) {
        require(userChapters[user].length > 0, "AMANT: no chapters");
        return userChapters[user][userChapters[user].length - 1];
    }

    function getTotalImpact(address user) external view returns (int256) {
        Chapter[] memory chapters = userChapters[user];
        int256 total = 0;
        for (uint256 i = 0; i < chapters.length; i++) {
            total += chapters[i].impactAmount;
        }
        return total;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function setAuthorizedWriter(address _writer) external onlyOwner {
        authorizedWriter = _writer;
    }

    /// @notice Grant/revoke an additional writer (e.g. the vault, which writes the
    ///         genesis chapter on a user's first deposit).
    function setWriter(address _writer, bool _allowed) external onlyOwner {
        writers[_writer] = _allowed;
    }
}
