import type { Question } from "../type";
import styles from "../styles/sign.module.css";

type Props = {
  question: Question;
  currentIndex: number;
};


export default function Sign({ question, currentIndex }: Props) {
  return (
    <div className={styles.sign}>
      {/* cọc trái */}
      <div className={`${styles.post} ${styles.left}`} />

      {/* bảng */}
      <div className={styles.board}>
        {/* nail */}
        <span className={`${styles.nail} ${styles.tl}`} />
        <span className={`${styles.nail} ${styles.tr}`} />
        <span className={`${styles.nail} ${styles.bl}`} />
        <span className={`${styles.nail} ${styles.br}`} />

        {/* content */}
        <div className={styles.content}>
          <div className={styles.text}>
            {currentIndex + 1 + ". " + question.question}
          </div>

          {question.questionImage && (
            <img
              className={styles["question-img"]}
              src={question.questionImage}
              alt="Question image"
            />
          )}
        </div>
      </div>

      {/* cọc phải */}
      <div className={`${styles.post} ${styles.right}`} />
    </div>
  );
}