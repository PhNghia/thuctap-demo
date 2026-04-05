import { guideMascots } from "../constants";
import styles from "../styles/startScreen.module.css";

type MascotKey = keyof typeof guideMascots;

type Props = {
    classId: MascotKey;
    title: string;
    onStart: () => void;
};

export default function StartScreen({ classId, title, onStart }: Props) {
    const mascot = guideMascots[classId];

    return (
        <div className={styles['start-container']} style={{ background: mascot.theme.bg }}>
            <div className={styles['start-content']}>

                <div className={styles['topic']}>
                    <h6 className={styles['intro-text']} style={{ color: mascot.theme.text }}>TOPIC:</h6>
                    <h2 className={styles['game-title']} style={{ color: mascot.theme.primary }}>{title}</h2>
                </div>

                <img
                    src={mascot.src}
                    alt="mascot"
                    className={styles.mascot}
                    style={{ filter: `drop-shadow(0 0 10px ${mascot.theme.primary})` }}
                />

                <h1 className={styles['game-title']} style={{ color: mascot.theme.primary }}>{mascot.name}</h1>

                <h6 className={styles['intro-text']} style={{ color: mascot.theme.text }}>
                    {mascot.intro}
                </h6>



                <button className={styles['start-btn']} style={{ backgroundColor: mascot.theme.button }} onClick={onStart}>
                    START GAME
                </button>
            </div>
        </div>
    );
}