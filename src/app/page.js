//import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				
				<img
					src="/piero2.jpg"
					alt="Piero Savastano"
					width={"100%"}
				/>

				<h1>
					Piero Savastano
				</h1>

				<p>
					Started as a young research scientist specialized on computational neuroscience, cognitive psychology, artificial life and artificial intelligence.
					<br />
					Ended up creating videos, maintaining an AI open source framework and consulting internationally on AI.
				</p>

				<h2>
					Follow me
				</h2>
				<div className={styles.ctas}>
					<a className={styles.primary} href="https://www.linkedin.com/in/piero-savastano-523b3016/" target="_blank">
						LinkedIn
					</a>
					<a className={styles.primary} href="https://github.com/pieroit" target="_blank">
						GitHub
					</a>
					<a className={styles.primary} href="https://www.youtube.com/@PieroSavastano" target="_blank">
						YouTube
					</a>
					<a className={styles.primary} href="https://www.tiktok.com/@piero.savastano" target="_blank">
						TikTok
					</a>
				</div>

				<h2>
					Projects
				</h2>
				<div className={styles.ctas}>
					<a className={styles.primary} href="https://cheshirecat.ai" target="_blank">
						Cheshire Cat AI
					</a>
					<a className={styles.primary} href="https://voxmachina.it" target="_blank">
						Vox Machina Meetup
					</a>
				</div>

				<h2>
					Blog
				</h2>
				<div className={styles.ctas}>
					<span>
						<a className={styles.primary} target="_blank">
							...coming soon
						</a>
					</span>
				</div>

			</main>
			<footer className={styles.footer}>
				<small>
					Copyright Piero Savastano {new Date().getFullYear()}
				</small>
			</footer>
		</div>
	);
}
