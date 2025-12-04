"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Heart, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Comment {
    id: number;
    author: string;
    content: string;
    created_at: string;
}

interface Post {
    id: number;
    author: string;
    content: string;
    image_url: string;
    created_at: string;
}

function PostItem({ post }: { post: Post }) {
    const { address } = useAccount();
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);

    useEffect(() => {
        fetchLikes();
        fetchComments();
    }, [post.id]);

    const fetchLikes = async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}/like`);
            const data = await res.json();
            setLikes(data.count || 0);
        } catch (err) {
            console.error("Failed to fetch likes", err);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}/comment`);
            const data = await res.json();
            if (Array.isArray(data)) setComments(data);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    const [isRoaring, setIsRoaring] = useState(false);

    const handleLike = async () => {
        if (!address) {
            alert("Please connect your wallet to roar!");
            return;
        }

        // Optimistic update
        const isLiked = false; // We don't track my like status yet, but we can animate
        setIsRoaring(true);
        setTimeout(() => setIsRoaring(false), 1000); // Reset animation

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: address })
            });
            const data = await res.json();
            fetchLikes(); // Refresh count
        } catch (err) {
            console.error("Failed to like", err);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment || !address) {
            if (!address) alert("Please connect your wallet to comment!");
            return;
        }
        setIsCommenting(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: address, content: newComment })
            });
            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (err) {
            console.error("Failed to comment", err);
        } finally {
            setIsCommenting(false);
        }
    };

    return (
        <Card className="neo-shadow-sm border-2 border-black">
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="text-xs font-mono bg-black text-white px-2 py-1 rounded-full">
                        {(post as any).author_display ? (post as any).author_display : `${post.author.slice(0, 6)}...${post.author.slice(-4)}`}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
                <p className="whitespace-pre-wrap font-medium">{post.content}</p>
            </CardContent>
            <CardFooter className="bg-gray-50 p-2 flex flex-col gap-2 border-t-2 border-black">
                <div className="flex gap-4 w-full">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`flex gap-1 hover:bg-yellow-100 transition-all ${isRoaring ? 'animate-bounce text-2xl' : ''}`}
                    >
                        <span className={`text-xl ${isRoaring ? 'scale-150 transition-transform duration-300' : ''}`}>🦁</span> {likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="flex gap-1">
                        <MessageCircle className="w-4 h-4" /> {comments.length}
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full space-y-2 pt-2">
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {comments.map(c => (
                                <div key={c.id} className="bg-white p-2 border border-gray-200 rounded text-sm">
                                    <div className="font-bold text-xs text-gray-500">{c.author.slice(0, 6)}...</div>
                                    <div>{c.content}</div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComment} className="flex gap-2">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="h-8 text-xs"
                            />
                            <Button type="submit" size="sm" disabled={isCommenting} className="h-8 bg-black text-white hover:bg-gray-800">
                                Send
                            </Button>
                        </form>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

export default function CommunityFeed({ communityName }: { communityName: string }) {
    const { address } = useAccount();
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [communityName]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`/api/posts?communityName=${communityName}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setPosts(data);
            }
        } catch (err) {
            console.error("Failed to fetch posts", err);
        }
    };

    const handlePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !address) return;

        setIsPosting(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    communityName,
                    author: address,
                    content,
                    imageUrl: ""
                })
            });

            if (res.ok) {
                setContent("");
                fetchPosts();
            }
        } catch (err) {
            console.error("Failed to create post", err);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="neo-shadow border-2 border-black">
                <CardHeader>
                    <CardTitle className="text-xl font-bold uppercase">Community Wall</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePost} className="space-y-4">
                        <Textarea
                            placeholder="Share something with the community..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="neo-shadow-sm min-h-[100px]"
                        />
                        <Button
                            type="submit"
                            className="w-full font-bold neo-shadow-sm bg-[#FFDE00] text-black hover:bg-[#FFE55C]"
                            disabled={isPosting || !content}
                        >
                            {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isPosting ? "Posting..." : "Post to Wall"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                ))}
                {posts.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        No posts yet. Be the first to post!
                    </div>
                )}
            </div>
        </div>
    );
}
